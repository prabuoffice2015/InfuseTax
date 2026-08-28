<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Capsule\Manager as DB;

/**
 * Class Wallet (Eloquent Model)
 *
 * @package App\Models
 */
class Wallet extends Model {
    protected $table = 'wallets';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'balance'    => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function tenant() {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public static function getBalanceByUserId(string $userId): float {
        $wallet = self::where('user_id', $userId)->first();
        return $wallet ? floatval($wallet->balance) : 0.00;
    }

    public static function updateBalance(string $userId, float $newBalance): bool {
        $wallet = self::where('user_id', $userId)->first();
        if (!$wallet) return false;
        return $wallet->update(['balance' => $newBalance]);
    }

    public static function transferP2P(string $senderId, string $receiverId, float $amount, string $tenantId, string $txnId): bool {
        if ($amount <= 0) return false;

        return DB::connection()->transaction(function() use ($senderId, $receiverId, $amount, $tenantId, $txnId) {
            $senderWallet = self::where('user_id', $senderId)->lockForUpdate()->first();
            if (!$senderWallet || $senderWallet->balance < $amount) {
                return false;
            }

            $receiverWallet = self::where('user_id', $receiverId)->lockForUpdate()->first();
            if (!$receiverWallet) {
                return false;
            }

            $senderWallet->decrement('balance', $amount);
            $receiverWallet->increment('balance', $amount);

            return true;
        });
    }
}
