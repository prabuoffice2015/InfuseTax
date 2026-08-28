<?php

namespace App\Core;

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;
use PDO;
use Throwable;

/**
 * Class Database
 *
 * Bootstraps Laravel Eloquent ORM Capsule and provides PDO backwards compatibility.
 *
 * @package App\Core
 */
class Database {
    private static ?Capsule $capsule = null;

    /**
     * Initializes and boots Laravel Eloquent ORM Capsule Manager.
     */
    public static function bootEloquent(): Capsule {
        if (self::$capsule !== null) {
            return self::$capsule;
        }

        $config = require __DIR__ . '/../../config/database.php';
        $driver = $config['default'] ?? 'pgsql';
        $dbConfig = $config['connections'][$driver] ?? [];

        $capsule = new Capsule;
        $capsule->addConnection([
            'driver'    => 'pgsql',
            'host'      => $dbConfig['host'] ?? getenv('DB_HOST') ?: 'postgres',
            'port'      => $dbConfig['port'] ?? getenv('DB_PORT') ?: '5432',
            'database'  => $dbConfig['database'] ?? getenv('DB_DATABASE') ?: 'infusetax_db',
            'username'  => $dbConfig['username'] ?? getenv('DB_USERNAME') ?: 'infusetax_user',
            'password'  => $dbConfig['password'] ?? getenv('DB_PASSWORD') ?: 'infusetax_secure_password',
            'charset'   => 'utf8',
            'prefix'    => '',
            'schema'    => 'public',
            'sslmode'   => 'prefer',
        ]);

        $capsule->setEventDispatcher(new Dispatcher(new Container));
        $capsule->setAsGlobal();
        $capsule->bootEloquent();

        self::$capsule = $capsule;
        return self::$capsule;
    }

    /**
     * Retrieves the underlying PDO connection for raw queries and backwards compatibility.
     */
    public static function getConnection(): ?PDO {
        try {
            $capsule = self::bootEloquent();
            return $capsule->getConnection()->getPdo();
        } catch (Throwable $e) {
            return null;
        }
    }
}
