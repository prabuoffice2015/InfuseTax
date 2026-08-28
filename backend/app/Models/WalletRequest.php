<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Capsule\Manager as DB;
use App\Services\WhatsAppService;

/**
 * Class WalletRequest (Eloquent Model)
 *
 * @package App\Models
 */
class WalletRequest extends Model {
    protected $table = 'wallet_requests';
    protected $keyType = 'string';
    public $incrementing = false;
    const UPDATED_AT = null;
    protected $guarded = [];

    protected $casts = [
        'amount'      => 'float',
        'created_at'  => 'datetime',
        'approved_at' => 'datetime',
    ];

    public static function generateUuid(): string {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    protected static function booted() {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = self::generateUuid();
            }
        });
    }

    public function requester() {
        return $this->belongsTo(User::class, 'requester_id', 'id');
    }

    public function approver() {
        return $this->belongsTo(User::class, 'approver_id', 'id');
    }

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    /**
     * Approves a wallet request transactionally, credits wallet, and triggers WhatsApp alert.
     */
    public static function approve(string $requestId, ?string $approverId, ?string $remarks = null): bool {
        return DB::connection()->transaction(function() use ($requestId, $approverId, $remarks) {
            $req = self::where('id', $requestId)->where('status', 'pending')->lockForUpdate()->first();
            if (!$req) return false;

            $req->update([
                'status'      => 'approved',
                'approver_id' => $approverId,
                'approved_at' => now(),
                'remarks'     => $remarks ?: $req->remarks,
            ]);

            // Credit Requester's Wallet
            $wallet = Wallet::where('user_id', $req->requester_id)->lockForUpdate()->first();
            if (!$wallet) {
                $wallet = Wallet::create([
                    'user_id'   => $req->requester_id,
                    'tenant_id' => $req->tenant_id,
                    'balance'   => 0.00,
                ]);
            }

            $prevBalance = floatval($wallet->balance);
            $wallet->increment('balance', $req->amount);
            $newBalance = $prevBalance + floatval($req->amount);

            // Log in Audit Ledger
            AuditLedger::log(
                tenantId: $req->tenant_id,
                referenceId: $req->reference_no ?: 'WAL-APP-' . substr($req->id, 0, 8),
                actorId: $approverId,
                actionType: 'WALLET_TOPUP_CREDIT',
                debitUserId: null,
                creditUserId: $req->requester_id,
                amount: $req->amount,
                balanceAfter: $newBalance,
                narration: "Wallet top-up approved: ₹" . number_format($req->amount, 2) . " via " . $req->payment_mode
            );

            // Trigger WhatsApp Communication
            try {
                $requester = User::find($req->requester_id);
                $approver  = $approverId ? User::find($approverId) : null;
                WhatsAppService::sendWalletApprovedNotification(
                    walletRequest: $req,
                    requester: $requester,
                    approver: $approver,
                    newBalance: $newBalance,
                    tenantId: $req->tenant_id
                );
            } catch (\Throwable $e) {}

            return true;
        });
    }

    /**
     * Rejects a wallet request with a reason.
     */
    public static function reject(string $requestId, ?string $approverId, ?string $reason = null): bool {
        $req = self::where('id', $requestId)->where('status', 'pending')->first();
        if (!$req) return false;

        return $req->update([
            'status'      => 'rejected',
            'approver_id' => $approverId,
            'approved_at' => now(),
            'remarks'     => $reason ?: 'Rejected by administrator',
        ]);
    }
}
