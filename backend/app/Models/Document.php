<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Document (Eloquent Model)
 *
 * @package App\Models
 */
class Document extends Model {
    protected $table = 'documents';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'file_size_kb' => 'integer',
        'uploaded_at'  => 'datetime',
        'created_at'   => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
}
