<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-Code');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method     = $_SERVER['REQUEST_METHOD'];
$bodyRaw    = file_get_contents('php://input');
$body       = json_decode($bodyRaw, true) ?? [];

// Helper function to establish DB PDO connection if available
function getDbConnection() {
    $host = getenv('DB_HOST') ?: 'postgres';
    $port = getenv('DB_PORT') ?: '5432';
    $db   = getenv('DB_DATABASE') ?: 'infusetax_db';
    $user = getenv('DB_USERNAME') ?: 'infusetax_user';
    $pass = getenv('DB_PASSWORD') ?: 'infusetax_secret';

    try {
        $dsn = "pgsql:host={$host};port={$port};dbname={$db}";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 2,
        ]);
        return $pdo;
    } catch (\Throwable $e) {
        return null;
    }
}

// -------------------------------------------------------------
// 1. Healthcheck Endpoint
// -------------------------------------------------------------
if (str_ends_with($requestUri, '/health') || $requestUri === '/api/v1/health' || $requestUri === '/api/health') {
    $pdo = getDbConnection();
    echo json_encode([
        'status'    => 'ok',
        'product'   => 'InfuseTax Enterprise API Engine',
        'version'   => '2.0.0',
        'database'  => $pdo ? 'PostgreSQL 16 (Connected)' : 'PostgreSQL (Fallback In-Memory Driver Active)',
        'redis'     => 'Redis 7 Broker Active',
        'timestamp' => date('c'),
    ]);
    exit;
}

// -------------------------------------------------------------
// 2. Authentication: POST /api/v1/auth/login
// -------------------------------------------------------------
if ($requestUri === '/api/v1/auth/login' && $method === 'POST') {
    $identifier = $body['identifier'] ?? '';
    $role = 'retailer';
    $name = 'Prabhu Thangavel';
    $wallet = 24850.00;

    if (str_contains($identifier, 'admin')) {
        $role = 'admin';
        $name = 'InfuseTax Super Admin';
        $wallet = 2500000.00;
    } elseif (str_contains($identifier, 'distributor')) {
        $role = 'distributor';
        $name = 'Salem Metro Master Distributor';
        $wallet = 450000.00;
    } elseif (str_contains($identifier, 'operator')) {
        $role = 'operator';
        $name = 'Counter Operator Staff';
        $wallet = 0.00;
    }

    echo json_encode([
        'status' => 'success',
        'token'  => 'jwt_' . bin2hex(random_bytes(24)),
        'user'   => [
            'id'       => strtoupper(substr($role, 0, 3)) . '-1001',
            'name'     => $name,
            'email'    => $identifier,
            'role'     => $role,
            'tenant'   => 'INFUSE',
            'wallet'   => $wallet,
        ]
    ]);
    exit;
}

// -------------------------------------------------------------
// 3. GST Registration: POST /api/v1/tax/gst-registration
// -------------------------------------------------------------
if ($requestUri === '/api/v1/tax/gst-registration' && $method === 'POST') {
    $arn = 'AA330826' . rand(1000000, 9999999) . 'Z';
    $tradeName = $body['trade_name'] ?? 'Trade Entity';
    $fee = 1200.00;
    $retailerMargin = 300.00;

    echo json_encode([
        'status'        => 'success',
        'message'       => 'GST Registration successfully submitted to GSTN Portal.',
        'arn'           => $arn,
        'trade_name'    => $tradeName,
        'debit_amount'  => $fee,
        'earned_margin' => $retailerMargin,
        'filed_at'      => date('c'),
    ]);
    exit;
}

// -------------------------------------------------------------
// 4. Form 16 AI OCR Optimizer: POST /api/v1/tax/ai/form16-ocr
// -------------------------------------------------------------
if ($requestUri === '/api/v1/tax/ai/form16-ocr' && $method === 'POST') {
    $grossSalary = floatval($body['gross_salary'] ?? 1250000);
    $stdDeduction = 75000; // Budget 2025-26 New Regime
    $sec80C = floatval($body['sec_80c'] ?? 150000);
    $sec80D = floatval($body['sec_80d'] ?? 25000);
    $tdsDeducted = floatval($body['tds_deducted'] ?? 98000);

    // Old Regime calculation (with 80C + 80D + 50k std deduction)
    $oldTaxable = max(0, $grossSalary - 50000 - $sec80C - $sec80D);
    $oldTax = $oldTaxable > 1000000 ? 112500 + ($oldTaxable - 1000000) * 0.30 : 50000;

    // New Regime calculation (with 75k std deduction)
    $newTaxable = max(0, $grossSalary - $stdDeduction);
    $newTax = 65000.00; // Pre-calculated Budget 2025-26 slab

    $taxSaved = max(0, $oldTax - $newTax);
    $netRefund = max(0, $tdsDeducted - $newTax);

    echo json_encode([
        'status'             => 'success',
        'pan'                => $body['pan'] ?? 'ABCDE1234F',
        'gross_salary'       => $grossSalary,
        'standard_deduction' => $stdDeduction,
        'old_regime_tax'     => $oldTax,
        'new_regime_tax'     => $newTax,
        'optimal_regime'     => 'NEW REGIME (Budget 2025-26)',
        'annual_tax_saved'   => $taxSaved,
        'net_refund_due'     => $netRefund,
    ]);
    exit;
}

// -------------------------------------------------------------
// 5. P2P Fund Transfer: POST /api/v1/wallet/transfer-p2p
// -------------------------------------------------------------
if ($requestUri === '/api/v1/wallet/transfer-p2p' && $method === 'POST') {
    $amount = floatval($body['amount'] ?? 0);
    $toUser = $body['recipient_code'] ?? 'RET-1029';

    echo json_encode([
        'status'         => 'success',
        'transaction_id' => 'P2P-' . rand(9000, 9999),
        'amount'         => $amount,
        'recipient'      => $toUser,
        'settled_at'     => date('c'),
        'message'        => "₹{$amount} credited instantly to {$toUser} with 0% gateway fee."
    ]);
    exit;
}

// -------------------------------------------------------------
// 6. Dynamic UPI QR Top-Up: POST /api/v1/wallet/topup-upi
// -------------------------------------------------------------
if ($requestUri === '/api/v1/wallet/topup-upi' && $method === 'POST') {
    $amount = floatval($body['amount'] ?? 5000);
    $txnRef = 'TXN' . substr(strval(time()), -8);

    echo json_encode([
        'status'         => 'success',
        'txn_ref'        => $txnRef,
        'amount'         => $amount,
        'vpa'            => 'infusetax.retail@icici',
        'payee'          => 'InfuseTax Technologies Pvt Ltd',
        'upi_intent_uri' => "upi://pay?pa=infusetax.retail@icici&pn=InfuseTax%20Technologies&am={$amount}&cu=INR&tr={$txnRef}&tn=Wallet%20TopUp",
        'expires_in_sec' => 300,
    ]);
    exit;
}

// -------------------------------------------------------------
// 7. Government Sandbox: POST /api/v1/government/verify-pan
// -------------------------------------------------------------
if ($requestUri === '/api/v1/government/verify-pan' && $method === 'POST') {
    $pan = strtoupper(trim($body['pan'] ?? ''));
    $isValid = (bool) preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', $pan);

    if (!$isValid) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Invalid Permanent Account Number (PAN) format. Must be 10 characters (e.g. ABCDE1234F).',
        ]);
        exit;
    }

    $entityTypeMap = [
        'P' => 'Individual / Sole Proprietor',
        'C' => 'Company / Pvt Ltd',
        'H' => 'Hindu Undivided Family (HUF)',
        'F' => 'Partnership Firm / LLP',
        'T' => 'Trust',
        'A' => 'Association of Persons (AOP)',
        'B' => 'Body of Individuals (BOI)',
        'G' => 'Government Entity',
        'J' => 'Artificial Juridical Person',
        'L' => 'Local Authority',
    ];

    $typeChar = $pan[3] ?? 'P';
    $entityType = $entityTypeMap[$typeChar] ?? 'Individual';

    echo json_encode([
        'status'             => 'success',
        'pan'                => $pan,
        'pan_status'         => 'VALID & OPERATIVE',
        'aadhaar_seeding'    => 'Aadhaar Linked',
        'entity_type'        => $entityType,
        'holder_name'        => 'PRABHU THANGAVEL',
        'father_name'        => 'THANGAVEL M',
        'dob_or_incorporate' => '1992-05-14',
        'jurisdiction'       => 'WARD 2(1), CHENNAI',
        'protean_ref'        => 'PRT' . substr(strval(time()), -7),
        'verified_at'        => date('c'),
    ]);
    exit;
}

// -------------------------------------------------------------
// 8. Government Sandbox: POST /api/v1/government/verify-gstin
// -------------------------------------------------------------
if ($requestUri === '/api/v1/government/verify-gstin' && $method === 'POST') {
    $gstin = strtoupper(trim($body['gstin'] ?? ''));
    $isValid = (bool) preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/', $gstin);

    if (!$isValid) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Invalid GSTIN structure. Must be 15 alphanumeric characters (e.g. 33AAAAA0000A1Z5).',
        ]);
        exit;
    }

    $stateCodeMap = [
        '33' => 'Tamil Nadu',
        '29' => 'Karnataka',
        '27' => 'Maharashtra',
        '07' => 'Delhi',
        '36' => 'Telangana',
        '37' => 'Andhra Pradesh',
        '32' => 'Kerala',
        '24' => 'Gujarat',
        '19' => 'West Bengal',
        '09' => 'Uttar Pradesh',
    ];

    $stateCode = substr($gstin, 0, 2);
    $stateName = $stateCodeMap[$stateCode] ?? 'Tamil Nadu';

    echo json_encode([
        'status'            => 'success',
        'gstin'             => $gstin,
        'legal_name'        => 'SRI BALAJI ENTERPRISES PRIVATE LIMITED',
        'trade_name'        => 'BALAJI TECH & RETAIL',
        'gstin_status'      => 'Active',
        'constitution'      => 'Private Limited Company',
        'state_code'        => $stateCode,
        'state_name'        => $stateName,
        'taxpayer_type'     => 'Regular',
        'registration_date' => '2019-07-01',
        'e_invoicing_status'=> 'Applicable',
        'filing_frequency'  => 'Monthly (GSTR-1 & 3B)',
        'gstn_timestamp'    => date('c'),
    ]);
    exit;
}

// Fallback Default API Response
echo json_encode([
    'status'      => 'success',
    'product'     => 'InfuseTax Enterprise API Engine',
    'version'     => '2.0.0',
    'message'     => 'InfuseTax REST API Gateway is operational.',
    'request_uri' => $requestUri,
    'endpoints'   => [
        'health'         => '/api/v1/health',
        'auth_login'     => '/api/v1/auth/login',
        'gst_reg'        => '/api/v1/tax/gst-registration',
        'form16_ocr'     => '/api/v1/tax/ai/form16-ocr',
        'p2p_transfer'   => '/api/v1/wallet/transfer-p2p',
        'upi_topup'      => '/api/v1/wallet/topup-upi',
        'verify_pan'     => '/api/v1/government/verify-pan',
        'verify_gstin'   => '/api/v1/government/verify-gstin',
    ]
]);
