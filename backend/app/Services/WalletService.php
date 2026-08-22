<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class WalletService
{
    /**
     * Deduct funds for a service transaction and distribute multi-tier commissions atomically.
     *
     * @throws Exception
     */
    public function processServiceTransaction(
        int $companyId,
        int $userId,
        float $serviceAmount,
        int $serviceId,
        string $referenceId,
        string $description,
        float $retailerCommission = 0.00,
        float $distributorCommission = 0.00,
        float $companyMargin = 0.00,
        ?int $operatorUserId = null,
        ?string $idempotencyKey = null
    ): Transaction {
        return DB::transaction(function () use (
            $companyId,
            $userId,
            $serviceAmount,
            $serviceId,
            $referenceId,
            $description,
            $retailerCommission,
            $distributorCommission,
            $companyMargin,
            $operatorUserId,
            $idempotencyKey
        ) {
            // 1. Idempotency Check
            if ($idempotencyKey) {
                $existing = Transaction::where('idempotency_key', $idempotencyKey)->first();
                if ($existing) {
                    return $existing;
                }
            }

            // 2. Lock Retailer Account Exclusively (Pessimistic Row-Locking)
            $account = Account::where('company_id', $companyId)
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            $netDeduction = $serviceAmount - $retailerCommission;

            if (($account->wallet_amount + $account->credit_limit) < $netDeduction) {
                throw new Exception("Insufficient wallet balance. Required: ₹" . number_format($netDeduction, 2) . ", Available: ₹" . number_format($account->wallet_amount, 2));
            }

            $prevBalance = $account->wallet_amount;
            $account->wallet_amount -= $netDeduction;
            $account->save();

            // 3. Insert Immutable Double-Entry Ledger Record
            $transaction = Transaction::create([
                'uuid'                 => (string) \Illuminate\Support\Str::uuid(),
                'company_id'           => $companyId,
                'user_id'              => $userId,
                'account_id'           => $account->id,
                'operator_user_id'     => $operatorUserId,
                'service_id'           => $serviceId,
                'reference_id'         => $referenceId,
                'trans_type'           => 'DEBIT',
                'current_amt'          => $prevBalance,
                'trans_amt'            => $serviceAmount,
                'retailer_comm'        => $retailerCommission,
                'distributor_comm'     => $distributorCommission,
                'company_margin'       => $companyMargin,
                'bal_amt'              => $account->wallet_amount,
                'service_desc'         => $description,
                'trans_status'         => 1,
                'idempotency_key'      => $idempotencyKey,
            ]);

            // 4. Upstream Multi-Tier Commission Credit for Parent Distributor (if applicable)
            $user = User::find($userId);
            if ($user && $user->parent_user_id && $distributorCommission > 0) {
                $distributorAccount = Account::where('company_id', $companyId)
                    ->where('user_id', $user->parent_user_id)
                    ->lockForUpdate()
                    ->first();

                if ($distributorAccount) {
                    $distPrevBal = $distributorAccount->wallet_amount;
                    $distributorAccount->wallet_amount += $distributorCommission;
                    $distributorAccount->save();

                    Transaction::create([
                        'uuid'             => (string) \Illuminate\Support\Str::uuid(),
                        'company_id'       => $companyId,
                        'user_id'          => $user->parent_user_id,
                        'account_id'       => $distributorAccount->id,
                        'service_id'       => $serviceId,
                        'reference_id'     => $referenceId,
                        'trans_type'       => 'CREDIT',
                        'current_amt'      => $distPrevBal,
                        'trans_amt'        => $distributorCommission,
                        'bal_amt'          => $distributorAccount->wallet_amount,
                        'service_desc'     => "Network Commission from downline retailer {$user->user_code}",
                        'trans_status'     => 1,
                    ]);
                }
            }

            return $transaction;
        });
    }

    /**
     * Peer-to-Peer Fund Transfer (Distributor -> Downline Retailer)
     *
     * @throws Exception
     */
    public function transferP2P(int $companyId, int $senderUserId, int $recipientUserId, float $amount, string $remarks = ''): bool
    {
        return DB::transaction(function () use ($companyId, $senderUserId, $recipientUserId, $amount, $remarks) {
            // Lock sender account
            $senderAccount = Account::where('company_id', $companyId)->where('user_id', $senderUserId)->lockForUpdate()->firstOrFail();
            if ($senderAccount->wallet_amount < $amount) {
                throw new Exception("Sender has insufficient wallet liquidity.");
            }

            // Lock recipient account
            $recipientAccount = Account::where('company_id', $companyId)->where('user_id', $recipientUserId)->lockForUpdate()->firstOrFail();

            // Debit sender
            $senderPrev = $senderAccount->wallet_amount;
            $senderAccount->wallet_amount -= $amount;
            $senderAccount->save();

            Transaction::create([
                'uuid'             => (string) \Illuminate\Support\Str::uuid(),
                'company_id'       => $companyId,
                'user_id'          => $senderUserId,
                'account_id'       => $senderAccount->id,
                'service_id'       => 9, // P2P
                'trans_type'       => 'DEBIT',
                'current_amt'      => $senderPrev,
                'trans_amt'        => $amount,
                'bal_amt'          => $senderAccount->wallet_amount,
                'service_desc'     => "P2P Fund Transfer to User #{$recipientUserId}: {$remarks}",
                'trans_status'     => 1,
            ]);

            // Credit recipient
            $recipPrev = $recipientAccount->wallet_amount;
            $recipientAccount->wallet_amount += $amount;
            $recipientAccount->save();

            Transaction::create([
                'uuid'             => (string) \Illuminate\Support\Str::uuid(),
                'company_id'       => $companyId,
                'user_id'          => $recipientUserId,
                'account_id'       => $recipientAccount->id,
                'service_id'       => 9, // P2P
                'trans_type'       => 'CREDIT',
                'current_amt'      => $recipPrev,
                'trans_amt'        => $amount,
                'bal_amt'          => $recipientAccount->wallet_amount,
                'service_desc'     => "Received P2P Fund Transfer from User #{$senderUserId}: {$remarks}",
                'trans_status'     => 1,
            ]);

            return true;
        });
    }
}
