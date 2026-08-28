<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class GstFiling (Eloquent Model)
 *
 * @package App\Models
 */
class GstFiling extends Model {
    protected $table = 'gst_filings';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'documents_payload' => 'array',
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

    public static function createFiling(array $data): ?string {
        try {
            $arn = 'AA330826' . rand(1000000, 9999999) . 'Z';
            $filing = self::create([
                'tenant_id'         => $data['tenant_id'],
                'retailer_id'       => $data['retailer_id'],
                'operator_id'       => $data['operator_id'] ?? null,
                'arn'               => $arn,
                'trade_name'        => $data['trade_name'],
                'legal_name'        => $data['legal_name'],
                'entity_type'       => $data['entity_type'] ?? 'Proprietorship',
                'pan'               => $data['pan'],
                'state'             => $data['state'] ?? 'Tamil Nadu',
                'portal_fee'        => $data['portal_fee'] ?? 1200.00,
                'retailer_margin'   => $data['margin'] ?? 300.00,
                'status'            => 'PENDING_APPROVAL',
                'documents_payload' => $data['documents_payload'] ?? []
            ]);
            return $filing ? $arn : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
