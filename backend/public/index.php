<?php

/**
 * InfuseTax Enterprise MVC API Gateway Entrypoint with Laravel Eloquent ORM
 */

// 1. Composer Autoloader (PSR-4 + Illuminate Eloquent Packages)
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $baseDir = __DIR__ . '/../app/';
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) return;
        $relativeClass = substr($class, $len);
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) require_once $file;
    });
}

// 2. Load Environment Variables from .env
\App\Core\Env::load(__DIR__ . '/../.env');

// 3. Boot Laravel Eloquent ORM Capsule Manager
\App\Core\Database::bootEloquent();

// 4. Apply OWASP HTTP Security Headers
\App\Core\Security::applySecurityHeaders();

// 5. Load API Route Definitions
require_once __DIR__ . '/../routes/api.php';

// 6. Dispatch Incoming HTTP Request
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri    = $_SERVER['REQUEST_URI'] ?? '/';

\App\Core\Router::dispatch($method, $uri);
