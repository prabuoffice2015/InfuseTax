<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class CompanyBankAccount (Eloquent Model)
 *
 * @package App\Models
 */
class CompanyBankAccount extends Model {
    protected $table = 'company_bank_accounts';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_active'  => 'boolean',
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

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    /**
     * Retrieve active bank accounts for retailer/admin top-up modals.
     */
    public static function getActiveAccounts(?string $tenantId = null): array {
        $query = self::where('is_active', true);
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }
        return $query->orderBy('is_primary', 'desc')
                     ->orderBy('created_at', 'asc')
                     ->get()
                     ->toArray();
    }

    /**
     * Retrieve all bank accounts for Super Admin configuration table.
     */
    public static function getAllAccounts(?string $tenantId = null): array {
        $query = self::query();
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }
        return $query->orderBy('is_primary', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->get()
                     ->toArray();
    }

    /**
     * Retrieve primary bank account / UPI configuration.
     */
    public static function getPrimaryAccount(?string $tenantId = null): ?array {
        $query = self::where('is_active', true);
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }
        $primary = $query->orderBy('is_primary', 'desc')->first();
        return $primary ? $primary->toArray() : null;
    }

    /**
     * Set an account as the primary account (resets others to false for tenant).
     */
    public static function setPrimary(string $id, string $tenantId): bool {
        try {
            self::where('tenant_id', $tenantId)->update(['is_primary' => false]);
            self::where('id', $id)->update(['is_primary' => true, 'is_active' => true]);
            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }
}
