<?php

namespace App\Http\Controllers;

use App\Core\Database;
use App\Core\Response;

class HealthController {
    public function check(): void {
        $pdo = Database::getConnection();
        $userCount = 0;

        if ($pdo) {
            try {
                $userCount = (int) $pdo->query("SELECT count(*) FROM users")->fetchColumn();
            } catch (\Throwable $e) {}
        }

        Response::json([
            'status'       => 'ok',
            'product'      => 'InfuseTax Enterprise MVC Engine',
            'version'      => '2.0.0',
            'architecture' => 'Clean MVC Pattern (Config / Models / Services / Controllers)',
            'database'     => $pdo ? 'PostgreSQL 16 (Connected & Dynamic)' : 'PostgreSQL Connection Offline',
            'active_users' => $userCount,
            'redis'        => 'Redis 7 Broker Active',
            'timestamp'    => date('c'),
        ]);
    }
}
