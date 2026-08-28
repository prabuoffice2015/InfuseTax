<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Notification (Eloquent Model)
 *
 * @package App\Models
 */
class Notification extends Model {
    protected $table = 'notifications';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'is_read'    => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public static function createBroadcast(
        string $tenantId,
        string $title,
        string $message,
        string $type = 'info',
        ?string $targetRole = null,
        ?string $actionUrl = null
    ): int {
        $query = User::where('tenant_id', $tenantId);
        if ($targetRole && $targetRole !== 'all') {
            $query->where('role', $targetRole);
        }

        $users = $query->get();
        $count = 0;
        foreach ($users as $u) {
            self::create([
                'tenant_id'  => $tenantId,
                'user_id'    => $u->id,
                'title'      => $title,
                'message'    => $message,
                'type'       => $type,
                'action_url' => $actionUrl,
                'is_read'    => false,
            ]);
            $count++;
        }
        return $count;
    }
}
