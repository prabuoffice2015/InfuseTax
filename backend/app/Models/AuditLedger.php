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
    const UPDATED_AT = null;
    protected $guarded = [];

    protected $casts = [
        'amount'        => 'float',
        'balance_after' => 'float',
        'created_at'    => 'datetime',
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
