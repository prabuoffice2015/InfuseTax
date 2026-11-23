<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Tenant (Eloquent Model)
 *
 * @package App\Models
 */
class Tenant extends Model {
    protected $table = 'tenants';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
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

    public function users() {
        return $this->hasMany(User::class, 'tenant_id', 'id');
    }

    public function distributors() {
        return $this->hasMany(User::class, 'tenant_id', 'id')->whereIn('role', ['admin', 'distributor']);
    }

    public function admins() {
        return $this->hasMany(User::class, 'tenant_id', 'id')->whereIn('role', ['admin', 'distributor']);
    }

    public function retailers() {
        return $this->hasMany(User::class, 'tenant_id', 'id')->where('role', 'retailer');
    }

    public function operators() {
        return $this->hasMany(User::class, 'tenant_id', 'id')->whereIn('role', ['customer', 'operator']);
    }

    public function customers() {
        return $this->hasMany(User::class, 'tenant_id', 'id')->whereIn('role', ['customer', 'operator']);
    }

    public function gstFilings() {
        return $this->hasMany(GstFiling::class, 'tenant_id', 'id');
    }

    public function itrFilings() {
        return $this->hasMany(ItrFiling::class, 'tenant_id', 'id');
    }

    public function servicePricings() {
        return $this->hasMany(ServicePricing::class, 'tenant_id', 'id');
    }

    public function pricingAuditLogs() {
        return $this->hasMany(PricingAuditLog::class, 'tenant_id', 'id');
    }

    public function announcements() {
        return $this->hasMany(Announcement::class, 'tenant_id', 'id');
    }

    public function wallets() {
        return $this->hasMany(Wallet::class, 'tenant_id', 'id');
    }

    public function walletRequests() {
        return $this->hasMany(WalletRequest::class, 'tenant_id', 'id');
    }

    public function utrRequests() {
        return $this->hasMany(UtrRequest::class, 'tenant_id', 'id');
    }

    public function auditLedger() {
        return $this->hasMany(AuditLedger::class, 'tenant_id', 'id');
    }

    public function companyBankAccounts() {
        return $this->hasMany(CompanyBankAccount::class, 'tenant_id', 'id');
    }

    public static function getAllWithMetrics(): array {
        $tenants = self::withCount([
            'users as total_users',
            'distributors as total_distributors',
            'retailers as total_retailers',
            'operators as total_operators',
        ])->orderBy('created_at', 'asc')->get();

        return $tenants->toArray();
    }

    public static function findRecord(string $id): ?array {
        $tenant = self::find($id);
        return $tenant ? $tenant->toArray() : null;
    }

    public static function createTenant(array $data): ?array {
        try {
            $tenant = self::create([
                'code'             => strtoupper(trim($data['code'] ?? '')),
                'company_name'     => trim($data['company_name'] ?? ''),
                'domain'           => strtolower(trim($data['domain'] ?? '')),
                'dlt_sender_id'    => strtoupper(trim($data['dlt_sender_id'] ?? 'INFUST')),
                'primary_color'    => trim($data['primary_color'] ?? '#1E40AF'),
                'secondary_color'  => trim($data['secondary_color'] ?? '#F59E0B'),
                'enabled_services' => trim($data['enabled_services'] ?? 'all'),
                'is_active'        => true,
            ]);
            return $tenant ? $tenant->toArray() : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function updateTenantMetadata(string $id, array $data): bool {
        try {
            $tenant = self::find($id);
            if (!$tenant) return false;

            return $tenant->update([
                'company_name'    => trim($data['company_name'] ?? $tenant->company_name),
                'domain'          => strtolower(trim($data['domain'] ?? $tenant->domain)),
                'dlt_sender_id'   => strtoupper(trim($data['dlt_sender_id'] ?? $tenant->dlt_sender_id)),
                'primary_color'   => trim($data['primary_color'] ?? $tenant->primary_color),
                'secondary_color' => trim($data['secondary_color'] ?? $tenant->secondary_color),
                'logo_url'        => trim($data['logo_url'] ?? $tenant->logo_url),
            ]);
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function toggleStatus(string $id): ?bool {
        try {
            $tenant = self::find($id);
            if (!$tenant) return null;

            $tenant->is_active = !$tenant->is_active;
            $tenant->save();
            return $tenant->is_active;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function updatePermissions(string $id, string $services): bool {
        try {
            $tenant = self::find($id);
            if (!$tenant) return false;

            return $tenant->update(['enabled_services' => $services]);
        } catch (\Throwable $e) {
            return false;
        }
    }
}
