<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Announcement (Eloquent Model)
 *
 * @package App\Models
 */
class Announcement extends Model {
    protected $table = 'announcements';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'is_active'  => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
}
