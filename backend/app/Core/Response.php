<?php

namespace App\Core;

class Response {
    public static function json(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-Code');
        
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        exit;
    }

    public static function success(array $data = [], string $message = 'Operation successful', int $statusCode = 200): void {
        self::json(array_merge(['status' => 'success', 'message' => $message], $data), $statusCode);
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, array $errors = []): void {
        $payload = ['status' => 'error', 'message' => $message];
        if (!empty($errors)) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $statusCode);
    }
}
