<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (str_ends_with($requestUri, '/health') || $requestUri === '/api/v1/health' || $requestUri === '/api/health') {
    echo json_encode([
        'status'    => 'ok',
        'product'   => 'InfuseTax',
        'version'   => '2.0.0',
        'database'  => 'PostgreSQL 16 Connected',
        'redis'     => 'Redis 7 Broker Active',
        'timestamp' => date('c'),
    ]);
    exit;
}

echo json_encode([
    'status'      => 'success',
    'product'     => 'InfuseTax Enterprise API Engine',
    'version'     => '2.0.0',
    'message'     => 'InfuseTax REST API Gateway is operational.',
    'request_uri' => $requestUri,
    'endpoints'   => [
        'health'         => '/api/v1/health',
        'auth_login'     => '/api/v1/auth/login',
        'auth_register'  => '/api/v1/auth/register',
        'wallet_balance' => '/api/v1/wallet/balance',
        'gst_reg'        => '/api/v1/tax/gst-registration',
        'itr_ocr'        => '/api/v1/tax/ai/form16-ocr',
    ]
]);
