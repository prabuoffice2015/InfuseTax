<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class PricingAuditLog (Eloquent Model)
 *
 * @package App\Models
 */
class PricingAuditLog extends Model {
    protected $table = 'pricing_audit_logs';
    protected $keyType = 'string';
    public $incrementing = false;
    const UPDATED_AT = null;
    protected $guarded = [];

    protected $casts = [
        'old_tier2_price' => 'float',
        'new_tier2_price' => 'float',
        'old_tier3_price' => 'float',
        'new_tier3_price' => 'float',
        'old_mrp_fee'     => 'float',
        'new_mrp_fee'     => 'float',
        'created_at'      => 'datetime',
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

    public function updatedBy() {
        return $this->belongsTo(User::class, 'updated_by_id', 'id');
    }
}
