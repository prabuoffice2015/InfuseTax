<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UtrRequest (Eloquent Model)
 *
 * @package App\Models
 */
class UtrRequest extends Model {
    protected $table = 'utr_requests';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'amount'      => 'float',
        'created_at'  => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function approver() {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
}
