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

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public function updatedBy() {
        return $this->belongsTo(User::class, 'updated_by_id', 'id');
    }
}
