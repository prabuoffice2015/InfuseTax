<?php

namespace App\Core;

use PDO;
use Throwable;

class Database {
    private static ?PDO $pdo = null;

    public static function getConnection(): ?PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $config = require __DIR__ . '/../../config/database.php';
        $driver = $config['default'] ?? 'pgsql';
        $dbConfig = $config['connections'][$driver] ?? [];

        $host = $dbConfig['host'] ?? 'postgres';
        $port = $dbConfig['port'] ?? '5432';
        $db   = $dbConfig['database'] ?? 'infusetax_db';
        $user = $dbConfig['username'] ?? 'infusetax_user';
        $pass = $dbConfig['password'] ?? 'infusetax_secure_password';
        $opts = $dbConfig['options'] ?? [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];

        try {
            $dsn = "pgsql:host={$host};port={$port};dbname={$db}";
            self::$pdo = new PDO($dsn, $user, $pass, $opts);
            return self::$pdo;
        } catch (Throwable $e) {
            return null;
        }
    }
}
