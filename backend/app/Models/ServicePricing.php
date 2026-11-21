<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ServicePricing (Eloquent Model)
 *
 * @package App\Models
 */
class ServicePricing extends Model {
    protected $table = 'service_pricings';
    protected $keyType = 'string';
    public $incrementing = false;
    const CREATED_AT = null;
    protected $guarded = [];

    protected $casts = [
        'tier2_price'      => 'float',
        'tier3_price'      => 'float',
        'mrp_customer_fee' => 'float',
        'updated_at'       => 'datetime',
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
}
