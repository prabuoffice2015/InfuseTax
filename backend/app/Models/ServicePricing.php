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
    protected $guarded = [];

    protected $casts = [
        'tier2_price'      => 'float',
        'tier3_price'      => 'float',
        'mrp_customer_fee' => 'float',
        'updated_at'       => 'datetime',
    ];

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
}
