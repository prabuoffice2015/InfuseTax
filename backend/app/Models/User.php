<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class User {
    public static function findByIdentifier(string $identifier): ?array {
        $pdo = Database::getConnection();
        if (!$pdo) {
            return null;
        }

        try {
            $stmt = $pdo->prepare("
                SELECT u.id, u.tenant_id, u.email, u.mobile, u.full_name, u.role, u.city, u.state, u.status,
                       w.balance as wallet_balance,
                       t.code as tenant_code, t.company_name
                FROM users u
                LEFT JOIN wallets w ON u.id = w.user_id
                LEFT JOIN tenants t ON u.tenant_id = t.id
                WHERE u.email = :id1 OR u.mobile = :id2 OR u.role = :id3
                LIMIT 1
            ");

            $cleanRole = '';
            if (str_contains($identifier, 'admin')) $cleanRole = 'super_admin';
            elseif (str_contains($identifier, 'distributor')) $cleanRole = 'distributor';
            elseif (str_contains($identifier, 'operator')) $cleanRole = 'operator';
            elseif (str_contains($identifier, 'retailer')) $cleanRole = 'retailer';

            $stmt->execute(['id1' => $identifier, 'id2' => $identifier, 'id3' => $cleanRole]);
            $user = $stmt->fetch();
            return $user ?: null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function findByRole(string $role): ?array {
        $pdo = Database::getConnection();
        if (!$pdo) return null;

        try {
            $stmt = $pdo->prepare("
                SELECT u.id, u.tenant_id, u.email, u.full_name, u.role, w.balance
                FROM users u
                LEFT JOIN wallets w ON u.id = w.user_id
                WHERE u.role = :r
                LIMIT 1
            ");
            $stmt->execute(['r' => $role]);
            return $stmt->fetch() ?: null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
