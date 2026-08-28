<?php

namespace App\Http\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Security;
use App\Http\Middleware\AuthMiddleware;
use App\Models\User;
use App\Models\Wallet;
use App\Models\GstFiling;
use App\Models\ItrFiling;
use App\Models\AuditLedger;
use App\Models\Notification;
use App\Services\TaxEngineService;
use PDO;

class TaxController {
    /**
     * Helper to retrieve service price dynamically for tenant.
     */
    private static function getServiceRate(PDO $pdo, string $tenantId, string $serviceKey, float $defaultPrice): float {
        try {
            $stmt = $pdo->prepare("SELECT tier3_price, mrp_customer_fee FROM service_pricings WHERE tenant_id = :tid AND service_key = :sk LIMIT 1");
            $stmt->execute(['tid' => $tenantId, 'sk' => $serviceKey]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row && !empty($row['tier3_price'])) {
                return floatval($row['tier3_price']);
            }
        } catch (\Throwable $e) {}
        return $defaultPrice;
    }

    /**
     * 1. GST Registration Desk (Sole Proprietorship / Private Limited / Partnership & LLP)
     */
    public function submitGstRegistration(array $body): void {
        $actor = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();
        if (!$pdo) Response::error('Database unavailable.', 500);

        $userId   = $actor['sub'] ?? $actor['id'] ?? '';
        $role     = $actor['role'] ?? 'retailer';
        $tenantId = $actor['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001';

        $regType    = Security::sanitizeString($body['reg_type'] ?? 'sole_proprietorship'); // sole_proprietorship | private_limited | partnership_llp
        $tradeName  = Security::sanitizeString($body['trade_name'] ?? $body['company_name'] ?? $body['firm_name'] ?? '');
        $legalName  = Security::sanitizeString($body['legal_name'] ?? $tradeName);
        $pan        = substr(strtoupper(Security::sanitizeString($body['pan'] ?? '')), 0, 10);
        $mobile     = Security::sanitizeString($body['mobile'] ?? $body['company_mobile'] ?? $body['firm_mobile'] ?? '');
        $email      = Security::sanitizeString($body['email'] ?? $body['company_email'] ?? $body['firm_email'] ?? '');
        $state      = Security::sanitizeString($body['state'] ?? 'Tamil Nadu');
        $docsPayload = json_encode($body['documents'] ?? $body['documents_payload'] ?? (object)[]);

        if (empty($tradeName) || strlen($tradeName) < 2) {
            Response::error("Business / Trade name is mandatory.", 422);
        }
        if (empty($pan) || strlen($pan) < 5) {
            Response::error("Valid PAN or Registration number is mandatory.", 422);
        }
        $rawDocs = $body['documents'] ?? $body['documents_payload'] ?? [];
        if (is_string($rawDocs)) $rawDocs = json_decode($rawDocs, true) ?: [];
        if (empty($rawDocs) || count($rawDocs) === 0) {
            Response::error("Mandatory scanned color copy documents must be attached before submitting.", 422);
        }

        // Multi-tier document approval workflow: All filings require approval from Distributor (Tier 2) or Retailer (Tier 3)
        $isOperator = ($role === 'operator' || $role === 'employee');
        $status     = 'PENDING_APPROVAL';

                $serviceKey = match($regType) {
            'sole_proprietorship' => 'gst_reg_sole_prop',
            'private_limited'     => 'gst_reg_pvt_ltd',
            'partnership_llp'     => 'gst_reg_llp',
            default               => 'gst_reg_sole_prop'
        };
        $defaultCost = match($regType) {
            'sole_proprietorship' => 1100.00,
            'private_limited'     => 1800.00,
            'partnership_llp'     => 1500.00,
            default               => 1100.00
        };
        $portalFee  = self::getServiceRate($pdo, $tenantId, $serviceKey, $defaultCost);
        $mrpFee     = floatval($body['mrp_customer_fee'] ?? 1500.00);
        $margin     = max(0.00, $mrpFee - $portalFee);

        try {
            $pdo->beginTransaction();

            $stmtW = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = :uid FOR UPDATE");
            $stmtW->execute(['uid' => $userId]);
            $currBal = floatval($stmtW->fetchColumn() ?: 0.00);

            if ($currBal < $portalFee) {
                $pdo->rollBack();
                Response::error("Insufficient wallet balance (₹" . number_format($currBal, 2) . "). Required fee: ₹" . number_format($portalFee, 2) . ". Please top up.", 422);
            }

            $newBalance = $currBal - $portalFee;

            // Deduct wallet
            $stmtUp = $pdo->prepare("UPDATE wallets SET balance = :bal, updated_at = NOW() WHERE user_id = :uid");
            $stmtUp->execute(['bal' => $newBalance, 'uid' => $userId]);

            $arn = 'AA330826' . rand(1000000, 9999999) . 'Z';

            // Find parent retailer / distributor if actor is operator
            $retailerId = $userId;
            $operatorId = null;
            if ($isOperator) {
                $operatorId = $userId;
                $stmtParent = $pdo->prepare("SELECT parent_id FROM users WHERE id = :uid");
                $stmtParent->execute(['uid' => $userId]);
                $retailerId = $stmtParent->fetchColumn() ?: $userId;
            }

            // Insert GST filing record
            $stmtFiling = $pdo->prepare("
                INSERT INTO gst_filings (tenant_id, retailer_id, operator_id, arn, trade_name, legal_name, entity_type, pan, state, portal_fee, retailer_margin, status, documents_payload, created_at)
                VALUES (:tid, :rid, :oid, :arn, :trade, :legal, :etype, :pan, :state, :fee, :margin, :status, :docs, NOW())
            ");
            $stmtFiling->execute([
                'tid'    => $tenantId,
                'rid'    => $retailerId,
                'oid'    => $operatorId,
                'arn'    => $arn,
                'trade'  => $tradeName,
                'legal'  => $legalName,
                'etype'  => $regType,
                'pan'    => $pan,
                'state'  => $state,
                'fee'    => $portalFee,
                'margin' => $margin,
                'status' => $status,
                'docs'   => $docsPayload
            ]);

            // Audit Ledger Log
            AuditLedger::log(
                tenantId: $tenantId,
                referenceId: $arn,
                actorId: $userId,
                actionType: 'GST_REGISTRATION_DEBIT',
                debitUserId: $userId,
                creditUserId: null,
                amount: $portalFee,
                balanceAfter: $newBalance,
                narration: "GST Registration ({$regType}) for {$tradeName} - Status: {$status} (ARN: {$arn})"
            );

            Notification::create(
                tenantId: $tenantId,
                title: "GST Registration Filed (" . $arn . ")",
                message: "New application for '" . $tradeName . "' submitted for compliance verification.",
                category: "filing",
                userId: $userId,
                targetRole: "all",
                referenceId: $arn
            );

            $pdo->commit();

            Response::json([
                'status'         => 'success',
                'message'        => $isOperator ? 'GST Registration submitted and routed to Retailer & Distributor for document verification.' : 'GST Registration processed and ARN issued.',
                'arn'            => $arn,
                'filing_status'  => $status,
                'reg_type'       => $regType,
                'trade_name'     => $tradeName,
                'mobile'         => $mobile,
                'email'          => $email,
                'debit_amount'   => $portalFee,
                'earned_margin'  => $margin,
                'new_wallet_bal' => $newBalance,
                'filed_at'       => date('c'),
            ]);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error('Failed to process GST Registration.', 500, ['details' => $e->getMessage()]);
        }
    }

    /**
     * 2. Income Tax (IT) Filing Desk (Individual & Business Person)
     */
    public function submitItFiling(array $body): void {
        $actor = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();
        if (!$pdo) Response::error('Database unavailable.', 500);

        $userId   = $actor['sub'] ?? $actor['id'] ?? '';
        $role     = $actor['role'] ?? 'retailer';
        $tenantId = $actor['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001';

        $filerType      = Security::sanitizeString($body['filer_type'] ?? 'individual'); // individual | business
        $customerName   = Security::sanitizeString($body['customer_name'] ?? '');
        $itLoginUser    = Security::sanitizeString($body['it_login_user'] ?? $body['pan'] ?? '');
        $itLoginPass    = Security::sanitizeString($body['it_login_password'] ?? '********');
        $pan            = substr(strtoupper(Security::sanitizeString($body['pan'] ?? '')), 0, 10);
        $aadhaar        = Security::sanitizeString($body['aadhaar'] ?? '');
        $gstNo          = strtoupper(Security::sanitizeString($body['gst_no'] ?? ''));
        $ssiMsme        = Security::sanitizeString($body['ssi_msme'] ?? '');
        $mobile         = Security::sanitizeString($body['mobile'] ?? '');
        $email          = Security::sanitizeString($body['email'] ?? '');
        $bankStatements = Security::sanitizeString($body['bank_statements_period'] ?? '01st Apr to 31st Mar (Full FY)');
        $docsPayload    = json_encode($body['documents'] ?? $body['documents_payload'] ?? (object)[]);

        if (empty($customerName) || strlen($customerName) < 2) {
            Response::error("Taxpayer customer name is mandatory.", 422);
        }
        if (empty($pan) || strlen($pan) < 5) {
            Response::error("Valid PAN is mandatory for IT return filing.", 422);
        }

        $isOperator = ($role === 'operator' || $role === 'employee');
        $status     = 'PENDING_APPROVAL';

        $portalFee  = self::getServiceRate($pdo, $tenantId, 'itr_filing', 550.00);
        $mrpFee     = floatval($body['mrp_customer_fee'] ?? 800.00);
        $margin     = max(0.00, $mrpFee - $portalFee);

        try {
            $pdo->beginTransaction();

            $stmtW = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = :uid FOR UPDATE");
            $stmtW->execute(['uid' => $userId]);
            $currBal = floatval($stmtW->fetchColumn() ?: 0.00);

            if ($currBal < $portalFee) {
                $pdo->rollBack();
                Response::error("Insufficient wallet balance (₹" . number_format($currBal, 2) . "). Required fee: ₹" . number_format($portalFee, 2) . ".", 422);
            }

            $newBalance = $currBal - $portalFee;

            $stmtUp = $pdo->prepare("UPDATE wallets SET balance = :bal, updated_at = NOW() WHERE user_id = :uid");
            $stmtUp->execute(['bal' => $newBalance, 'uid' => $userId]);

            $ack = 'ITR2026' . rand(100000, 999999);

            $retailerId = $userId;
            $operatorId = null;
            if ($isOperator) {
                $operatorId = $userId;
                $stmtParent = $pdo->prepare("SELECT parent_id FROM users WHERE id = :uid");
                $stmtParent->execute(['uid' => $userId]);
                $retailerId = $stmtParent->fetchColumn() ?: $userId;
            }

            $stmtFiling = $pdo->prepare("
                INSERT INTO itr_filings (tenant_id, retailer_id, operator_id, ack_number, client_name, pan, assessment_year, itr_form, gross_salary, optimal_regime, tax_savings, net_refund, status, documents_payload, mobile, email, bank_period, portal_fee, retailer_margin, created_at)
                VALUES (:tid, :rid, :oid, :ack, :client, :pan, '2025-26', :itr_form, 0, 'OPTIMIZED_REGIME', 0, 0, :status, :docs, :mobile, :email, :bperiod, :fee, :margin, NOW())
            ");
            $stmtFiling->execute([
                'tid'      => $tenantId,
                'rid'      => $retailerId,
                'oid'      => $operatorId,
                'ack'      => $ack,
                'client'   => $customerName,
                'pan'      => $pan,
                'itr_form' => $filerType === 'business' ? 'ITR-4 (Business)' : 'ITR-1 (Individual)',
                'status'   => $status,
                'docs'     => $docsPayload,
                'mobile'   => $mobile,
                'email'    => $email,
                'bperiod'  => $bankStatements,
                'fee'      => $portalFee,
                'margin'   => $margin
            ]);

            AuditLedger::log(
                tenantId: $tenantId,
                referenceId: $ack,
                actorId: $userId,
                actionType: 'IT_FILING_DEBIT',
                debitUserId: $userId,
                creditUserId: null,
                amount: $portalFee,
                balanceAfter: $newBalance,
                narration: "Income Tax Return ({$filerType}) for {$customerName} - Status: {$status} (Ack: {$ack})"
            );

            Notification::create(
                tenantId: $tenantId,
                title: "ITR Filing Filed (" . $ack . ")",
                message: "Income Tax return for '" . $customerName . "' (PAN: " . $pan . ") filed successfully.",
                category: "filing",
                userId: $userId,
                targetRole: "all",
                referenceId: $ack
            );

            $pdo->commit();

            Response::json([
                'status'         => 'success',
                'message'        => $isOperator ? 'Income Tax Return logged and routed to Retailer & Distributor for document verification.' : 'Income Tax Return logged and ITR-V generated.',
                'ack_number'     => $ack,
                'filing_status'  => $status,
                'filer_type'     => $filerType,
                'customer_name'  => $customerName,
                'pan'            => $pan,
                'mobile'         => $mobile,
                'email'          => $email,
                'bank_period'    => $bankStatements,
                'debit_amount'   => $portalFee,
                'earned_margin'  => $margin,
                'new_wallet_bal' => $newBalance,
                'filed_at'       => date('c'),
            ]);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error('Failed to submit IT filing.', 500, ['details' => $e->getMessage()]);
        }
    }

    /**
     * Legacy Form 16 Optimizer alias
     */
    public function optimizeForm16(array $body): void {
        $this->submitItFiling($body);
    }

    /**
     * 3. GST Return Filing Desk (GSTR-1 & GSTR-3B)
     */
    public function submitGstrFiling(array $body): void {
        $actor = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();
        if (!$pdo) Response::error('Database unavailable.', 500);

        $userId   = $actor['sub'] ?? $actor['id'] ?? '';
        $role     = $actor['role'] ?? 'retailer';
        $tenantId = $actor['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001';

        $gstin      = strtoupper(Security::sanitizeString($body['gstin'] ?? ''));
        $period     = Security::sanitizeString($body['period'] ?? 'August 2026');
        $returnType = Security::sanitizeString($body['return_type'] ?? 'GSTR-3B');
        $turnover   = floatval($body['turnover'] ?? 0);
        $outputTax  = floatval($body['output_tax'] ?? 0);
        $itcClaim   = floatval($body['itc_claim'] ?? 0);
        $docsPayload = json_encode($body['documents'] ?? $body['documents_payload'] ?? (object)[]);

        if (empty($gstin) || strlen($gstin) < 10) {
            Response::error("Valid GSTIN is mandatory.", 422);
        }
        if ($turnover <= 0) {
            Response::error("Valid taxable turnover amount is mandatory.", 422);
        }

        $isOperator = ($role === 'operator' || $role === 'employee');
        $status     = 'PENDING_APPROVAL';

        $portalFee  = self::getServiceRate($pdo, $tenantId, 'gstr_filing', 350.00);
        $mrpFee     = floatval($body['mrp_customer_fee'] ?? 500.00);
        $margin     = max(0.00, $mrpFee - $portalFee);

        try {
            $pdo->beginTransaction();

            $stmtW = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = :uid FOR UPDATE");
            $stmtW->execute(['uid' => $userId]);
            $currBal = floatval($stmtW->fetchColumn() ?: 0.00);

            if ($currBal < $portalFee) {
                $pdo->rollBack();
                Response::error("Insufficient wallet balance (₹" . number_format($currBal, 2) . "). Required fee: ₹" . number_format($portalFee, 2) . ".", 422);
            }

            $newBalance = $currBal - $portalFee;

            $stmtUp = $pdo->prepare("UPDATE wallets SET balance = :bal, updated_at = NOW() WHERE user_id = :uid");
            $stmtUp->execute(['bal' => $newBalance, 'uid' => $userId]);

            $arn = 'AA330826' . rand(1000000, 9999999) . 'Z';

            $retailerId = $userId;
            $operatorId = null;
            if ($isOperator) {
                $operatorId = $userId;
                $stmtParent = $pdo->prepare("SELECT parent_id FROM users WHERE id = :uid");
                $stmtParent->execute(['uid' => $userId]);
                $retailerId = $stmtParent->fetchColumn() ?: $userId;
            }

            $stmtFiling = $pdo->prepare("
                INSERT INTO gst_filings (tenant_id, retailer_id, operator_id, arn, trade_name, legal_name, entity_type, pan, state, portal_fee, retailer_margin, status, documents_payload, created_at)
                VALUES (:tid, :rid, :oid, :arn, :trade, :legal, :etype, :pan, 'Tamil Nadu', :fee, :margin, :status, :docs, NOW())
            ");
            $stmtFiling->execute([
                'tid'    => $tenantId,
                'rid'    => $retailerId,
                'oid'    => $operatorId,
                'arn'    => $arn,
                'trade'  => "{$returnType} ({$period})",
                'legal'  => $gstin,
                'etype'  => $returnType,
                'pan'    => substr($gstin, 2, 10),
                'fee'    => $portalFee,
                'margin' => $margin,
                'status' => $status,
                'docs'   => $docsPayload
            ]);

            AuditLedger::log(
                tenantId: $tenantId,
                referenceId: $arn,
                actorId: $userId,
                actionType: 'GSTR_FILING_DEBIT',
                debitUserId: $userId,
                creditUserId: null,
                amount: $portalFee,
                balanceAfter: $newBalance,
                narration: "GST Return ({$returnType} {$period}) for {$gstin} - Status: {$status} (ARN: {$arn})"
            );            Notification::create(
                tenantId: $tenantId,
                title: "GST Return Filed (" . $arn . ")",
                message: $returnType . " return for '" . $gstin . "' (" . $period . ") processed.",
                category: "filing",
                userId: $userId,
                targetRole: "all",
                referenceId: $arn
            );

            $pdo->commit();

            Response::json([
                'status'         => 'success',
                'message'        => $isOperator ? "{$returnType} Return submitted and routed to Retailer & Distributor for document verification." : "{$returnType} Return filed successfully.",
                'arn'            => $arn,
                'filing_status'  => $status,
                'gstin'          => $gstin,
                'period'         => $period,
                'debit_amount'   => $portalFee,
                'earned_margin'  => $margin,
                'new_wallet_bal' => $newBalance,
                'filed_at'       => date('c'),
            ]);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error('Failed to submit GST return.', 500, ['details' => $e->getMessage()]);
        }
    }

    /**
     * 4. Multi-Tier Service Approvals List (For Tier 2 Distributors & Tier 3 Retailers)
     */
    public function getServiceApprovalsList(): void {
        $actor = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();
        if (!$pdo) Response::error('Database unavailable.', 500);

        $userId   = $actor['sub'] ?? $actor['id'] ?? '';
        $role     = $actor['role'] ?? 'retailer';
        $tenantId = $actor['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001';

        $items = [];

        try {
            // 1. Fetch GST Filings
            if ($role === 'super_admin') {
                $stmtGst = $pdo->prepare("
                    SELECT g.id, 'gst' as service_category, g.arn, g.trade_name as client_name, g.entity_type, g.pan, 
                           g.portal_fee as amount, g.status, g.documents_payload, g.verified_doc_url, g.rejection_remarks,
                           u.full_name as operator_name, u.email as operator_email, u.mobile as operator_mobile,
                           to_char(g.created_at, 'DD Mon YYYY, HH24:MI') as submitted_at
                    FROM gst_filings g
                    LEFT JOIN users u ON g.operator_id = u.id
                    ORDER BY g.created_at DESC
                ");
                $stmtGst->execute();
            } else if ($role === 'distributor') {
                $stmtGst = $pdo->prepare("
                    SELECT g.id, 'gst' as service_category, g.arn, g.trade_name as client_name, g.entity_type, g.pan, 
                           g.portal_fee as amount, g.status, g.documents_payload, g.verified_doc_url, g.rejection_remarks,
                           COALESCE(u.full_name, r.full_name, 'Retailer / Operator') as operator_name, 
                           COALESCE(u.email, r.email) as operator_email, 
                           COALESCE(u.mobile, r.mobile) as operator_mobile,
                           to_char(g.created_at, 'DD Mon YYYY, HH24:MI') as submitted_at
                    FROM gst_filings g
                    LEFT JOIN users u ON g.operator_id = u.id
                    LEFT JOIN users r ON g.retailer_id = r.id
                    WHERE g.tenant_id = :tid
                    ORDER BY g.created_at DESC
                ");
                $stmtGst->execute(['tid' => $tenantId]);
            } else {
                // Retailer (Tier 3)
                $stmtGst = $pdo->prepare("
                    SELECT g.id, 'gst' as service_category, g.arn, g.trade_name as client_name, g.entity_type, g.pan, 
                           g.portal_fee as amount, g.status, g.documents_payload, g.verified_doc_url, g.rejection_remarks,
                           COALESCE(u.full_name, r.full_name, 'Shop Operator') as operator_name, 
                           COALESCE(u.email, r.email) as operator_email, 
                           COALESCE(u.mobile, r.mobile) as operator_mobile,
                           to_char(g.created_at, 'DD Mon YYYY, HH24:MI') as submitted_at
                    FROM gst_filings g
                    LEFT JOIN users u ON g.operator_id = u.id
                    LEFT JOIN users r ON g.retailer_id = r.id
                    WHERE g.retailer_id = :uid OR g.operator_id = :uid OR g.tenant_id = :tid
                    ORDER BY g.created_at DESC
                ");
                $stmtGst->execute(['uid' => $userId, 'tid' => $tenantId]);
            }
            $gstRows = $stmtGst->fetchAll(PDO::FETCH_ASSOC);

            // 2. Fetch ITR Filings
            if ($role === 'super_admin') {
                $stmtItr = $pdo->prepare("
                    SELECT i.id, 'itr' as service_category, i.ack_number as arn, i.client_name, i.itr_form as entity_type, i.pan, 
                           i.portal_fee as amount, i.status, i.documents_payload, i.verified_doc_url, i.rejection_remarks,
                           i.mobile as client_mobile, i.email as client_email, i.bank_period,
                           u.full_name as operator_name, u.email as operator_email, u.mobile as operator_mobile,
                           to_char(i.created_at, 'DD Mon YYYY, HH24:MI') as submitted_at
                    FROM itr_filings i
                    LEFT JOIN users u ON i.operator_id = u.id
                    ORDER BY i.created_at DESC
                ");
                $stmtItr->execute();
            } else if ($role === 'distributor') {
                $stmtItr = $pdo->prepare("
                    SELECT i.id, 'itr' as service_category, i.ack_number as arn, i.client_name, i.itr_form as entity_type, i.pan, 
                           i.portal_fee as amount, i.status, i.documents_payload, i.verified_doc_url, i.rejection_remarks,
                           i.mobile as client_mobile, i.email as client_email, i.bank_period,
                           u.full_name as operator_name, u.email as operator_email, u.mobile as operator_mobile,
                           to_char(i.created_at, 'DD Mon YYYY, HH24:MI') as submitted_at
                    FROM itr_filings i
                    LEFT JOIN users u ON i.operator_id = u.id
                    WHERE i.tenant_id = :tid
                    ORDER BY i.created_at DESC
                ");
                $stmtItr->execute(['tid' => $tenantId]);
            } else {
                $stmtItr = $pdo->prepare("
                    SELECT i.id, 'itr' as service_category, i.ack_number as arn, i.client_name, i.itr_form as entity_type, i.pan, 
                           i.portal_fee as amount, i.status, i.documents_payload, i.verified_doc_url, i.rejection_remarks,
                           i.mobile as client_mobile, i.email as client_email, i.bank_period,
                           u.full_name as operator_name, u.email as operator_email, u.mobile as operator_mobile,
                           to_char(i.created_at, 'DD Mon YYYY, HH24:MI') as submitted_at
                    FROM itr_filings i
                    LEFT JOIN users u ON i.operator_id = u.id
                    WHERE i.retailer_id = :uid OR i.tenant_id = :tid
                    ORDER BY i.created_at DESC
                ");
                $stmtItr->execute(['uid' => $userId, 'tid' => $tenantId]);
            }
            $itrRows = $stmtItr->fetchAll(PDO::FETCH_ASSOC);

            // Merge and decode JSON payloads
            $allRows = array_merge($gstRows, $itrRows);
            foreach ($allRows as &$row) {
                if (!empty($row['documents_payload'])) {
                    $row['documents'] = is_string($row['documents_payload']) ? json_decode($row['documents_payload'], true) : $row['documents_payload'];
                } else {
                    $row['documents'] = [];
                }
            }

            $items = $allRows;
        } catch (\Throwable $e) {}

        Response::json([
            'status'       => 'success',
            'applications' => $items,
            'count'        => count($items)
        ]);
    }

    /**
     * 5. Approve Service Application with Verified Document Upload
     */
    public function approveServiceApplication(array $body): void {
        $actor = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();
        if (!$pdo) Response::error('Database unavailable.', 500);

        $approverId = $actor['sub'] ?? $actor['id'] ?? '';
        $appId      = Security::sanitizeString($body['application_id'] ?? '');
        $serviceCat = Security::sanitizeString($body['service_category'] ?? 'gst'); // gst | itr
        // Preserve raw Data URL / Cloud URL without HTML entity encoding corruption
        $verifiedUrl = trim($body['verified_doc_url'] ?? '');
        if (empty($verifiedUrl)) {
            $verifiedUrl = 'https://vault.infusetax.com/proofs/' . $appId . '_verified.pdf';
        }
        $remarks    = Security::sanitizeString($body['remarks'] ?? 'Documents verified and approved.');

        if (empty($appId)) {
            Response::error('Application ID is required.', 422);
        }

        try {
            $pdo->beginTransaction();

            if ($serviceCat === 'itr') {
                $stmt = $pdo->prepare("
                    UPDATE itr_filings 
                    SET status = 'APPROVED', approver_id = :aid, verified_doc_url = :vurl, approved_at = NOW()
                    WHERE ack_number = :id OR id::text = :id
                ");
                $stmt->execute(['aid' => $approverId, 'vurl' => $verifiedUrl, 'id' => $appId]);
            } else {
                $stmt = $pdo->prepare("
                    UPDATE gst_filings 
                    SET status = 'APPROVED', approver_id = :aid, verified_doc_url = :vurl, approved_at = NOW()
                    WHERE arn = :id OR id::text = :id
                ");
                $stmt->execute(['aid' => $approverId, 'vurl' => $verifiedUrl, 'id' => $appId]);
            }

            \App\Models\Notification::create([
                'tenant_id' => 'a0000000-0000-0000-0000-000000000001',
                'title'     => "Application Approved (" . $appId . ")",
                'message'   => "Application (" . $appId . ") verified and certificate attached.",
                'type'      => "approval",
                'is_read'   => false,
            ]);

            // Trigger WhatsApp Communication
            try {
                $filing = ($serviceCat === 'itr') 
                    ? \App\Models\ItrFiling::where('ack_number', $appId)->orWhere('id', $appId)->first()
                    : \App\Models\GstFiling::where('arn', $appId)->orWhere('id', $appId)->first();
                if ($filing) {
                    $recipient = \App\Models\User::find($filing->retailer_id ?? $filing->operator_id);
                    \App\Services\WhatsAppService::sendServiceApprovedNotification(
                        filing: $filing,
                        recipient: $recipient,
                        serviceName: ($serviceCat === 'itr' ? 'Income Tax Return' : 'GST Registration / Filing'),
                        verifiedDocUrl: $verifiedUrl
                    );
                }
            } catch (\Throwable $e) {}

            $pdo->commit();

            Response::json([
                'status'           => 'success',
                'message'          => 'Service application approved and verified document attached successfully.',
                'application_id'   => $appId,
                'approval_status'  => 'APPROVED',
                'verified_doc_url' => $verifiedUrl,
                'approved_at'      => date('c')
            ]);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error('Failed to approve service application.', 500, ['details' => $e->getMessage()]);
        }
    }

    /**
     * 6. Reject Service Application with Mandatory Rejection Remarks & Float Refund
     */
    public function rejectServiceApplication(array $body): void {
        $actor = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();
        if (!$pdo) Response::error('Database unavailable.', 500);

        $approverId = $actor['sub'] ?? $actor['id'] ?? '';
        $appId      = Security::sanitizeString($body['application_id'] ?? '');
        $serviceCat = Security::sanitizeString($body['service_category'] ?? 'gst'); // gst | itr
        $rejectionRemarks = Security::sanitizeString($body['rejection_remarks'] ?? '');

        if (empty($appId)) {
            Response::error('Application ID is required.', 422);
        }

        if (empty($rejectionRemarks)) {
            Response::error('Rejection remarks are mandatory to explain required document corrections to operator.', 422);
        }

        try {
            $pdo->beginTransaction();

            $feeToRefund     = 0.00;
            $userIdToRefund  = null;
            $refNumber       = $appId;
            $tenantId        = 'a0000000-0000-0000-0000-000000000001';

            if ($serviceCat === 'itr') {
                $stmtGet = $pdo->prepare("SELECT operator_id, retailer_id, portal_fee, ack_number, tenant_id FROM itr_filings WHERE ack_number = :id OR id::text = :id");
                $stmtGet->execute(['id' => $appId]);
                $row = $stmtGet->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $feeToRefund    = floatval($row['portal_fee'] ?: 550.00);
                    $userIdToRefund = !empty($row['operator_id']) ? $row['operator_id'] : $row['retailer_id'];
                    $refNumber      = $row['ack_number'];
                    $tenantId       = $row['tenant_id'];
                }

                $stmt = $pdo->prepare("
                    UPDATE itr_filings 
                    SET status = 'REJECTED', approver_id = :aid, rejection_remarks = :rem, rejected_at = NOW()
                    WHERE ack_number = :id OR id::text = :id
                ");
                $stmt->execute(['aid' => $approverId, 'rem' => $rejectionRemarks, 'id' => $appId]);
            } else {
                $stmtGet = $pdo->prepare("SELECT operator_id, retailer_id, portal_fee, arn, tenant_id FROM gst_filings WHERE arn = :id OR id::text = :id");
                $stmtGet->execute(['id' => $appId]);
                $row = $stmtGet->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $feeToRefund    = floatval($row['portal_fee'] ?: 1150.00);
                    $userIdToRefund = !empty($row['operator_id']) ? $row['operator_id'] : $row['retailer_id'];
                    $refNumber      = $row['arn'];
                    $tenantId       = $row['tenant_id'];
                }

                $stmt = $pdo->prepare("
                    UPDATE gst_filings 
                    SET status = 'REJECTED', approver_id = :aid, rejection_remarks = :rem, rejected_at = NOW()
                    WHERE arn = :id OR id::text = :id
                ");
                $stmt->execute(['aid' => $approverId, 'rem' => $rejectionRemarks, 'id' => $appId]);
            }

            // Refund deducted fee back to submitter (Operator or Retailer)
            if ($userIdToRefund && $feeToRefund > 0) {
                $stmtW = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = :uid FOR UPDATE");
                $stmtW->execute(['uid' => $userIdToRefund]);
                $currBal = floatval($stmtW->fetchColumn() ?: 0.00);
                $newBal  = $currBal + $feeToRefund;

                $stmtUp = $pdo->prepare("UPDATE wallets SET balance = :bal, updated_at = NOW() WHERE user_id = :uid");
                $stmtUp->execute(['bal' => $newBal, 'uid' => $userIdToRefund]);

                AuditLedger::log(
                    tenantId: $tenantId ?? 'a0000000-0000-0000-0000-000000000001',
                    referenceId: "REFUND-{$refNumber}",
                    actorId: $approverId,
                    actionType: 'SERVICE_REJECTION_REFUND',
                    debitUserId: null,
                    creditUserId: $userIdToRefund,
                    amount: $feeToRefund,
                    balanceAfter: $newBal,
                    narration: "Rejection Refund for {$refNumber} - Reason: {$rejectionRemarks}"
                );
            }

            Notification::create(
                tenantId: $tenantId ?? 'a0000000-0000-0000-0000-000000000001',
                title: "Application Rejected (" . $appId . ")",
                message: "Application (" . $appId . ") rejected: " . $rejectionRemarks . ". Fee of ₹" . $feeToRefund . " refunded to wallet.",
                category: "approval",
                userId: $userIdToRefund,
                targetRole: "all",
                referenceId: $appId
            );

            $pdo->commit();

            Response::json([
                'status'            => 'success',
                'message'           => 'Service application rejected and shift float refunded.',
                'application_id'    => $appId,
                'approval_status'   => 'REJECTED',
                'rejection_remarks' => $rejectionRemarks,
                'refunded_amount'   => $feeToRefund,
                'rejected_at'       => date('c')
            ]);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error('Failed to reject service application.', 500, ['details' => $e->getMessage()]);
        }
    }

    /**
     * 7. Recent Filings Table with User-Type Isolation (GST Registration, IT Filing, GSTR Filing)
     */
    public function getRecentFilings(): void {
        $actor = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();
        $filings = [];

        $role   = $actor['role'] ?? 'retailer';
        $userId = $actor['sub'] ?? $actor['id'] ?? null;

        if ($pdo && !empty($userId)) {
            try {
                if ($role === 'super_admin') {
                    $rows = $pdo->query("
                        SELECT g.id as uuid, g.arn as id, g.arn, g.trade_name as client, g.trade_name as client_name, 'gst' as service_category,
                               g.entity_type, g.pan, '' as mobile, '' as email,
                               CASE 
                                 WHEN g.entity_type LIKE '%GSTR%' THEN g.entity_type
                                 ELSE 'GST Registration'
                               END as service, 
                               g.portal_fee as amount, g.retailer_margin as margin, 
                               to_char(g.created_at, 'DD Mon YYYY, HH24:MI') as date, g.status,
                               g.documents_payload, g.verified_doc_url, g.rejection_remarks
                        FROM gst_filings g
                        UNION ALL
                        SELECT i.id as uuid, i.ack_number as id, i.ack_number as arn, i.client_name as client, i.client_name, 'itr' as service_category,
                               i.itr_form as entity_type, i.pan, COALESCE(i.mobile, '') as mobile, COALESCE(i.email, '') as email,
                               'Income Tax Return' as service,
                               i.portal_fee as amount, i.retailer_margin as margin,
                               to_char(i.created_at, 'DD Mon YYYY, HH24:MI') as date, i.status,
                               i.documents_payload, i.verified_doc_url, i.rejection_remarks
                        FROM itr_filings i
                        ORDER BY date DESC
                        LIMIT 50
                    ")->fetchAll(PDO::FETCH_ASSOC);
                } else if ($role === 'operator' || $role === 'employee') {
                    $stmt = $pdo->prepare("
                        SELECT * FROM (
                            SELECT g.id as uuid, g.arn as id, g.arn, g.trade_name as client, g.trade_name as client_name, 'gst' as service_category,
                                   g.entity_type, g.pan, '' as mobile, '' as email,
                                   CASE 
                                     WHEN g.entity_type LIKE '%GSTR%' THEN g.entity_type
                                     ELSE 'GST Registration'
                                   END as service, 
                                   g.portal_fee as amount, g.retailer_margin as margin, 
                                   to_char(g.created_at, 'DD Mon YYYY, HH24:MI') as date, g.status,
                                   g.documents_payload, g.verified_doc_url, g.rejection_remarks,
                                   g.created_at
                            FROM gst_filings g
                            WHERE g.operator_id = ? OR g.retailer_id = ?
                            UNION ALL
                            SELECT i.id as uuid, i.ack_number as id, i.ack_number as arn, i.client_name as client, i.client_name, 'itr' as service_category,
                                   i.itr_form as entity_type, i.pan, COALESCE(i.mobile, '') as mobile, COALESCE(i.email, '') as email,
                                   'Income Tax Return' as service,
                                   i.portal_fee as amount, i.retailer_margin as margin,
                                   to_char(i.created_at, 'DD Mon YYYY, HH24:MI') as date, i.status,
                                   i.documents_payload, i.verified_doc_url, i.rejection_remarks,
                                   i.created_at
                            FROM itr_filings i
                            WHERE i.operator_id = ? OR i.retailer_id = ?
                        ) sub
                        ORDER BY created_at DESC
                        LIMIT 50
                    ");
                    $stmt->execute([$userId, $userId, $userId, $userId]);
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $stmt = $pdo->prepare("
                        SELECT * FROM (
                            SELECT g.id as uuid, g.arn as id, g.arn, g.trade_name as client, g.trade_name as client_name, 'gst' as service_category,
                                   g.entity_type, g.pan, '' as mobile, '' as email,
                                   CASE 
                                     WHEN g.entity_type LIKE '%GSTR%' THEN g.entity_type
                                     ELSE 'GST Registration'
                                   END as service, 
                                   g.portal_fee as amount, g.retailer_margin as margin, 
                                   to_char(g.created_at, 'DD Mon YYYY, HH24:MI') as date, g.status,
                                   g.documents_payload, g.verified_doc_url, g.rejection_remarks,
                                   g.created_at
                            FROM gst_filings g
                            WHERE g.retailer_id = ? OR g.retailer_id IN (SELECT id FROM users WHERE parent_id = ?) OR g.operator_id IN (SELECT id FROM users WHERE parent_id = ?)
                            UNION ALL
                            SELECT i.id as uuid, i.ack_number as id, i.ack_number as arn, i.client_name as client, i.client_name, 'itr' as service_category,
                                   i.itr_form as entity_type, i.pan, COALESCE(i.mobile, '') as mobile, COALESCE(i.email, '') as email,
                                   'Income Tax Return' as service,
                                   i.portal_fee as amount, i.retailer_margin as margin,
                                   to_char(i.created_at, 'DD Mon YYYY, HH24:MI') as date, i.status,
                                   i.documents_payload, i.verified_doc_url, i.rejection_remarks,
                                   i.created_at
                            FROM itr_filings i
                            WHERE i.retailer_id = ? OR i.retailer_id IN (SELECT id FROM users WHERE parent_id = ?) OR i.operator_id IN (SELECT id FROM users WHERE parent_id = ?)
                        ) sub
                        ORDER BY created_at DESC
                        LIMIT 50
                    ");
                    $stmt->execute([$userId, $userId, $userId, $userId, $userId, $userId]);
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }

                if (!empty($rows)) {
                    foreach ($rows as &$row) {
                        if (!empty($row['documents_payload'])) {
                            $row['documents'] = is_string($row['documents_payload']) ? json_decode($row['documents_payload'], true) : $row['documents_payload'];
                        } else {
                            $row['documents'] = [];
                        }
                    }
                    $filings = $rows;
                }
            } catch (\Throwable $e) {}
        }

        Response::json([
            'status'  => 'success',
            'filings' => $filings,
            'count'   => count($filings)
        ]);
    }
}
