<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AuditLedger (Eloquent Model)
 *
 * @package App\Models
 */
class AuditLedger extends Model {
    protected $table = 'audit_ledger';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'amount'        => 'float',
        'balance_after' => 'float',
        'created_at'    => 'datetime',
    ];

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public function actor() {
        return $this->belongsTo(User::class, 'actor_id', 'id');
    }

    public function debitUser() {
        return $this->belongsTo(User::class, 'debit_user_id', 'id');
    }

    public function creditUser() {
        return $this->belongsTo(User::class, 'credit_user_id', 'id');
    }

    public static function log(
        string $tenantId,
        string $referenceId,
        ?string $actorId,
        string $actionType,
        ?string $debitUserId = null,
        ?string $creditUserId = null,
        float $amount = 0.00,
        float $balanceAfter = 0.00,
        string $narration = ''
    ): bool {
        try {
            self::create([
                'tenant_id'      => $tenantId,
                'reference_id'   => $referenceId,
                'actor_id'       => $actorId,
                'action_type'    => $actionType,
                'debit_user_id'  => $debitUserId,
                'credit_user_id' => $creditUserId,
                'amount'         => $amount,
                'balance_after'  => $balanceAfter,
                'narration'      => $narration,
            ]);
            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }
}
