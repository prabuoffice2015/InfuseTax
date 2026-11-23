<?php

namespace App\Http\Controllers;

use App\Core\Response;
use App\Core\Security;
use App\Http\Middleware\AuthMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\Models\CompanyBankAccount;
use App\Models\Tenant;
use App\Models\User;

/**
 * Class CompanyBankAccountController
 *
 * Handles Super Admin Bank Account & Dynamic UPI QR Configurations and
 * Retailer/Admin active deposit accounts.
 *
 * @package App\Http\Controllers
 */
class CompanyBankAccountController {

    /**
     * List bank accounts for current tenant.
     * Super Admin sees all accounts; Retailers/Admins see active accounts.
     */
    public function listAccounts(): void {
        $actor = AuthMiddleware::authenticate();
        $userRole = strtolower($actor['role'] ?? 'retailer');
        $userId = $actor['sub'] ?? $actor['id'] ?? null;
        $userRec = $userId ? User::find($userId) : null;
        $tenantId = $_GET['tenant_id'] ?? ($userRec['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001');

        $activeOnly = isset($_GET['active_only']) && $_GET['active_only'] === '1';

        if ($userRole === 'super_admin' && !$activeOnly) {
            $accounts = CompanyBankAccount::getAllAccounts($tenantId);
        } else {
            $accounts = CompanyBankAccount::getActiveAccounts($tenantId);
        }

        $primaryAccount = CompanyBankAccount::getPrimaryAccount($tenantId);

        // Fallbacks if no accounts yet
        $primaryUpiVpa = $primaryAccount['upi_id'] ?? 'taxpartner.retail@icici';
        $primaryPayee = $primaryAccount['account_holder'] ?? 'TaxPartner Technologies Pvt Ltd';
        $primaryQrUrl = $primaryAccount['qr_code_url'] ?? null;

        Response::json([
            'status'          => 'success',
            'count'           => count($accounts),
            'bank_accounts'   => $accounts,
            'primary_account' => $primaryAccount,
            'primary_upi'     => [
                'vpa'            => $primaryUpiVpa,
                'payee_name'     => $primaryPayee,
                'qr_code_url'    => $primaryQrUrl,
                'bank_name'      => $primaryAccount['bank_name'] ?? 'HDFC Bank',
                'account_number' => $primaryAccount['account_number'] ?? '50200012345678',
                'ifsc_code'      => $primaryAccount['ifsc_code'] ?? 'HDFC0001234',
                'branch'         => $primaryAccount['branch'] ?? 'Anna Nagar, Chennai'
            ]
        ]);
    }

    /**
     * Super Admin: Add a new company bank account at database level.
     */
    public function createAccount(array $body): void {
        RoleMiddleware::authorize(['super_admin']);
        $actor = AuthMiddleware::authenticate();
        $userId = $actor['sub'] ?? $actor['id'] ?? null;
        $userRec = $userId ? User::find($userId) : null;
        $tenantId = $body['tenant_id'] ?? ($userRec['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001');

        $bankName      = Security::sanitizeString($body['bank_name'] ?? '');
        $accountHolder = Security::sanitizeString($body['account_holder'] ?? '');
        $accountNumber = Security::sanitizeString($body['account_number'] ?? '');
        $ifscCode      = strtoupper(Security::sanitizeString($body['ifsc_code'] ?? ''));
        $branch        = Security::sanitizeString($body['branch'] ?? '');
        $accountType   = strtoupper(Security::sanitizeString($body['account_type'] ?? 'CURRENT'));
        $upiId         = strtolower(Security::sanitizeString($body['upi_id'] ?? ''));
        $qrCodeUrl     = $body['qr_code_url'] ?? null;
        $isPrimary     = !empty($body['is_primary']);
        $isActive      = isset($body['is_active']) ? (bool)$body['is_active'] : true;

        if (empty($bankName) || empty($accountHolder) || empty($accountNumber) || empty($ifscCode)) {
            Response::error('Bank Name, Account Holder Name, Account Number, and IFSC Code are required.', 422);
        }

        // If marked primary, reset other accounts for this tenant
        if ($isPrimary) {
            CompanyBankAccount::where('tenant_id', $tenantId)->update(['is_primary' => false]);
        }

        // If this is the only account, auto-make it primary
        $existingCount = CompanyBankAccount::where('tenant_id', $tenantId)->count();
        if ($existingCount === 0) {
            $isPrimary = true;
        }

        $account = CompanyBankAccount::create([
            'tenant_id'      => $tenantId,
            'bank_name'      => $bankName,
            'account_holder' => $accountHolder,
            'account_number' => $accountNumber,
            'ifsc_code'      => $ifscCode,
            'branch'         => $branch,
            'account_type'   => $accountType,
            'upi_id'         => $upiId,
            'qr_code_url'    => $qrCodeUrl,
            'is_primary'     => $isPrimary,
            'is_active'      => $isActive,
        ]);

        Response::json([
            'status'  => 'success',
            'message' => "Bank account {$bankName} created successfully.",
            'account' => $account
        ], 201);
    }

    /**
     * Super Admin: Update an existing company bank account.
     */
    public function updateAccount(array $body): void {
        RoleMiddleware::authorize(['super_admin']);

        $id = $body['id'] ?? null;
        if (empty($id)) {
            Response::error('Bank account ID is required for update.', 422);
        }

        $account = CompanyBankAccount::find($id);
        if (!$account) {
            Response::error('Bank account not found.', 404);
        }

        $isPrimary = isset($body['is_primary']) ? (bool)$body['is_primary'] : $account->is_primary;

        if ($isPrimary && !$account->is_primary) {
            CompanyBankAccount::where('tenant_id', $account->tenant_id)->update(['is_primary' => false]);
        }

        $account->bank_name      = Security::sanitizeString($body['bank_name'] ?? $account->bank_name);
        $account->account_holder = Security::sanitizeString($body['account_holder'] ?? $account->account_holder);
        $account->account_number = Security::sanitizeString($body['account_number'] ?? $account->account_number);
        $account->ifsc_code      = strtoupper(Security::sanitizeString($body['ifsc_code'] ?? $account->ifsc_code));
        $account->branch         = Security::sanitizeString($body['branch'] ?? $account->branch);
        $account->account_type   = strtoupper(Security::sanitizeString($body['account_type'] ?? $account->account_type));
        $account->upi_id         = strtolower(Security::sanitizeString($body['upi_id'] ?? $account->upi_id));
        if (array_key_exists('qr_code_url', $body)) {
            $account->qr_code_url = $body['qr_code_url'];
        }
        $account->is_primary     = $isPrimary;
        if (isset($body['is_active'])) {
            $account->is_active  = (bool)$body['is_active'];
        }

        $account->save();

        Response::json([
            'status'  => 'success',
            'message' => "Bank account {$account->bank_name} updated successfully.",
            'account' => $account
        ]);
    }

    /**
     * Super Admin: Toggle active status of a company bank account.
     */
    public function toggleStatus(array $body): void {
        RoleMiddleware::authorize(['super_admin']);

        $id = $body['id'] ?? null;
        if (empty($id)) {
            Response::error('Bank account ID is required.', 422);
        }

        $account = CompanyBankAccount::find($id);
        if (!$account) {
            Response::error('Bank account not found.', 404);
        }

        $account->is_active = !$account->is_active;
        $account->save();

        Response::json([
            'status'    => 'success',
            'message'   => "Bank account {$account->bank_name} is now " . ($account->is_active ? 'Active' : 'Inactive') . ".",
            'is_active' => $account->is_active
        ]);
    }

    /**
     * Super Admin: Set an account as the primary bank / UPI account.
     */
    public function setPrimary(array $body): void {
        RoleMiddleware::authorize(['super_admin']);

        $id = $body['id'] ?? null;
        if (empty($id)) {
            Response::error('Bank account ID is required.', 422);
        }

        $account = CompanyBankAccount::find($id);
        if (!$account) {
            Response::error('Bank account not found.', 404);
        }

        CompanyBankAccount::setPrimary($id, $account->tenant_id);

        Response::json([
            'status'  => 'success',
            'message' => "{$account->bank_name} set as primary company account for deposits & UPI QR.",
            'account' => $account
        ]);
    }

    /**
     * Super Admin: Delete a company bank account.
     */
    public function deleteAccount(array $body): void {
        RoleMiddleware::authorize(['super_admin']);

        $id = $body['id'] ?? null;
        if (empty($id)) {
            Response::error('Bank account ID is required.', 422);
        }

        $account = CompanyBankAccount::find($id);
        if (!$account) {
            Response::error('Bank account not found.', 404);
        }

        $bankName = $account->bank_name;
        $account->delete();

        Response::json([
            'status'  => 'success',
            'message' => "Bank account {$bankName} removed successfully."
        ]);
    }

    /**
     * Super Admin: Configure Dynamic UPI QR Settings (GPay, PhonePe, Paytm, BHIM)
     */
    public function updateUpiConfig(array $body): void {
        RoleMiddleware::authorize(['super_admin']);

        $actor = AuthMiddleware::authenticate();
        $userId = $actor['sub'] ?? $actor['id'] ?? null;
        $userRec = $userId ? User::find($userId) : null;
        $tenantId = $body['tenant_id'] ?? ($userRec['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001');

        $vpa = strtolower(Security::sanitizeString($body['vpa'] ?? $body['upi_id'] ?? ''));
        $payeeName = Security::sanitizeString($body['payee_name'] ?? '');
        $qrCodeUrl = $body['qr_code_url'] ?? null;
        $bankAccountId = $body['bank_account_id'] ?? null;

        if (empty($vpa)) {
            Response::error('UPI VPA / ID (e.g. yourname@icici) is required.', 422);
        }

        // Find bank account to link or use primary
        $targetAccount = null;
        if (!empty($bankAccountId)) {
            $targetAccount = CompanyBankAccount::where('id', $bankAccountId)->where('tenant_id', $tenantId)->first();
        }
        if (!$targetAccount) {
            $targetAccount = CompanyBankAccount::where('tenant_id', $tenantId)->where('is_primary', true)->first();
        }
        if (!$targetAccount) {
            $targetAccount = CompanyBankAccount::where('tenant_id', $tenantId)->first();
        }

        if ($targetAccount) {
            $targetAccount->upi_id = $vpa;
            if (!empty($payeeName)) {
                $targetAccount->account_holder = $payeeName;
            }
            if ($qrCodeUrl !== null) {
                $targetAccount->qr_code_url = $qrCodeUrl;
            }
            $targetAccount->is_primary = true;
            $targetAccount->save();

            // Reset other accounts' is_primary
            CompanyBankAccount::where('tenant_id', $tenantId)
                ->where('id', '!=', $targetAccount->id)
                ->update(['is_primary' => false]);
        }

        Response::json([
            'status'      => 'success',
            'message'     => 'UPI QR code settings saved for GPay, PhonePe & Paytm.',
            'primary_upi' => [
                'vpa'         => $vpa,
                'payee_name'  => $payeeName ?: ($targetAccount->account_holder ?? 'TaxPartner Technologies Pvt Ltd'),
                'qr_code_url' => $qrCodeUrl,
            ]
        ]);
    }
}
