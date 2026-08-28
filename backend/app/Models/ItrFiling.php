<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ItrFiling (Eloquent Model)
 *
 * @package App\Models
 */
class ItrFiling extends Model {
    protected $table = 'itr_filings';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'documents_payload' => 'array',
        'gross_salary'      => 'float',
        'tax_savings'       => 'float',
        'net_refund'        => 'float',
        'portal_fee'        => 'float',
        'retailer_margin'   => 'float',
        'created_at'        => 'datetime',
        'approved_at'       => 'datetime',
        'rejected_at'       => 'datetime',
    ];

    public function retailer() {
        return $this->belongsTo(User::class, 'retailer_id', 'id');
    }

    public function operator() {
        return $this->belongsTo(User::class, 'operator_id', 'id');
    }

    public function approver() {
        return $this->belongsTo(User::class, 'approver_id', 'id');
    }

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
}
