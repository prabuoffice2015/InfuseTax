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

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    /**
     * Flexible create method supporting both Eloquent array syntax and PHP 8 named arguments.
     *
     * @param array|string|null $attributes
     * @param string|null $tenantId
     * @param string|null $title
     * @param string|null $message
     * @param string|null $category
     * @param string|null $userId
     * @param string|null $targetRole
     * @param string|null $referenceId
     * @param string|null $type
     * @return static
     */
    public static function create(
        $attributes = [],
        ?string $tenantId = null,
        ?string $title = null,
        ?string $message = null,
        ?string $category = null,
        ?string $userId = null,
        ?string $targetRole = null,
        ?string $referenceId = null,
        ?string $type = null
    ) {
        if (is_array($attributes) && !empty($attributes)) {
            $data = $attributes;
        } else {
            $data = [
                'tenant_id'    => $tenantId ?? 'a0000000-0000-0000-0000-000000000001',
                'user_id'      => $userId,
                'title'        => $title ?? 'Notification',
                'message'      => $message ?? '',
                'category'     => $category ?? ($type ?? 'system'),
                'target_role'  => $targetRole ?? 'all',
                'reference_id' => $referenceId,
                'is_read'      => false,
            ];
        }

        // Normalize keys for the notifications table schema
        if (isset($data['type']) && !isset($data['category'])) {
            $data['category'] = $data['type'];
        }
        unset($data['type'], $data['action_url']);

        if (!isset($data['tenant_id'])) {
            $data['tenant_id'] = 'a0000000-0000-0000-0000-000000000001';
        }
        if (!isset($data['category'])) {
            $data['category'] = 'system';
        }
        if (!isset($data['target_role'])) {
            $data['target_role'] = 'all';
        }
        if (!isset($data['is_read'])) {
            $data['is_read'] = false;
        }

        return (new static)->newQuery()->create($data);
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
