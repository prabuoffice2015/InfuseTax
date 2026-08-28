<?php

namespace App\Core;

class Router {
    private static array $routes = [];

    public static function get(string $path, string $handler): void {
        self::$routes['GET'][$path] = $handler;
    }

    public static function post(string $path, string $handler): void {
        self::$routes['POST'][$path] = $handler;
    }

    public static function put(string $path, string $handler): void {
        self::$routes['PUT'][$path] = $handler;
    }

    public static function delete(string $path, string $handler): void {
        self::$routes['DELETE'][$path] = $handler;
    }

    public static function dispatch(string $method, string $uri): void {
        if ($method === 'OPTIONS') {
            Response::json(['status' => 'ok'], 200);
        }

        $cleanUri = parse_url($uri, PHP_URL_PATH);
        $cleanUri = rtrim($cleanUri, '/') ?: '/';

        $routesForMethod = self::$routes[$method] ?? [];

        foreach ($routesForMethod as $routePath => $handler) {
            $routePathClean = rtrim($routePath, '/') ?: '/';

            if ($routePathClean === $cleanUri) {
                self::executeHandler($handler);
                return;
            }
        }

        // Fallback or 404
        Response::error("Endpoint '{$method} {$cleanUri}' not found.", 404, [
            'available_routes' => array_keys($routesForMethod),
        ]);
    }

    private static function executeHandler(string $handler): void {
        [$controllerName, $action] = explode('@', $handler);
        $fullControllerClass = "\\App\\Http\\Controllers\\" . $controllerName;

        if (!class_exists($fullControllerClass)) {
            Response::error("Controller {$fullControllerClass} does not exist.", 500);
        }

        $controller = new $fullControllerClass();
        if (!method_exists($controller, $action)) {
            Response::error("Action {$action} not found in {$fullControllerClass}.", 500);
        }

        $bodyRaw = file_get_contents('php://input');
        $body = json_decode($bodyRaw, true) ?? [];

        // Transparently handle AES-256 encrypted payload envelopes from frontend
        if (isset($body['_payload']) && is_string($body['_payload'])) {
            $decrypted = Security::decryptPayload($body['_payload']);
            if ($decrypted !== null) {
                $body = $decrypted;
            }
        } elseif (isset($body['_encrypted_payload']) && is_string($body['_encrypted_payload'])) {
            $decrypted = Security::decryptPayload($body['_encrypted_payload']);
            if ($decrypted !== null) {
                $body = $decrypted;
            }
        }

        $controller->$action($body);
    }
}
