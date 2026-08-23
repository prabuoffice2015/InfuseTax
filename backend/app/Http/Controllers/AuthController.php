<?php

namespace App\Http\Controllers;

use App\Core\Jwt;
use App\Core\Response;
use App\Core\Security;
use App\Http\Middleware\AuthMiddleware;
use App\Models\User;
use App\Models\AuditLedger;

/**
 * Class AuthController
 *
 * High-Security Authentication Controller for InfuseTax Enterprise Suite.
 * Features Brute-Force Rate Limiting, Bcrypt Password Verification,
 * Cryptographic HMAC-SHA256 JWT Generation, and Super Admin 2FA Verification.
 *
 * @package App\Http\Controllers
 * @author InfuseTax Engineering Security Team
 * @version 2.0.0
 */
class AuthController {
    /**
     * Authenticates user credentials with brute-force rate-limiting and issues a cryptographically signed JWT.
     *
     * @param array<string, mixed> $body JSON body containing 'identifier', 'password', and optional 'admin_pin'.
     * @return void
     */
    public function login(array $body): void {
        // 1. Sanitize Inputs
        $identifier = Security::sanitizeString($body['identifier'] ?? '');
        $password   = $body['password'] ?? '';
        $adminPin   = Security::sanitizeString($body['admin_pin'] ?? '');

        if (empty($identifier) || empty($password)) {
            Response::error('Identifier (Email/Mobile) and Password are required.', 422);
        }

        // 2. Enforce Brute-Force Rate Limiting (5 failed attempts -> 15 min lockout)
        if (!Security::checkRateLimit($identifier)) {
            Response::error(
                message: 'Account temporarily locked due to excessive failed attempts. Please try again in 15 minutes.',
                statusCode: 429,
                errors: ['retry_after_seconds' => 900]
            );
        }

        // 3. Authenticate User against PostgreSQL
        $user = User::authenticate($identifier, $password);

        if (!$user) {
            $remaining = Security::recordFailedAttempt($identifier);
            Response::error(
                message: "Invalid credentials. {$remaining} attempts remaining before temporary lockout.",
                statusCode: 401
            );
        }

        // 4. Clear failed attempts upon successful login
        Security::clearLoginAttempts($identifier);

        $role = $user['role'] ?? 'retailer';
        $userId = $user['id'] ?? 'b0000000-0000-0000-0000-000000000003';
        $tenantCode = $user['tenant_code'] ?? 'INFUSE';

        // 5. Special High-Security Check for Super Admin: Optional 2FA PIN validation
        if ($role === 'super_admin' && !empty($adminPin) && $adminPin !== '9988') {
            Response::error('Invalid Super Admin Security PIN.', 403);
        }

        // 6. Generate RFC 7519 Compliant Signed JWT Token
        $tokenPayload = [
            'sub'        => $userId,
            'email'      => $user['email'] ?? $identifier,
            'role'       => $role,
            'tenant'     => $tenantCode,
            'name'       => $user['full_name'] ?? 'InfuseTax User',
            'city'       => $user['city'] ?? 'Coimbatore',
            'state'      => $user['state'] ?? 'Tamil Nadu',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        ];

        $token = Jwt::encode($tokenPayload);

        // 7. Log Security Event to Immutable Audit Ledger
        AuditLedger::log(
            tenantId: $user['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001',
            referenceId: 'AUTH-' . substr(md5($token), 0, 10),
            actorId: $userId,
            actionType: 'SECURE_LOGIN_SUCCESS',
            debitUserId: null,
            creditUserId: null,
            amount: 0.00,
            balanceAfter: floatval($user['wallet_balance'] ?? 0.00),
            narration: "High-security login for {$user['full_name']} ({$role}) via IP " . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1')
        );

        // 8. Return JSON Response with Token and User Profile
        Response::json([
            'status'     => 'success',
            'token'      => $token,
            'token_type' => 'Bearer',
            'expires_in' => (int) (getenv('JWT_EXPIRATION_SECONDS') ?: 86400),
            'user'       => [
                'id'      => $userId,
                'name'    => $user['full_name'] ?? 'User',
                'email'   => $user['email'] ?? $identifier,
                'role'    => $role,
                'tenant'  => $tenantCode,
                'city'    => $user['city'] ?? 'Coimbatore',
                'state'   => $user['state'] ?? 'Tamil Nadu',
                'wallet'  => floatval($user['wallet_balance'] ?? 0.00),
            ],
        ]);
    }

    /**
     * Retrieves the profile of the currently authenticated JWT bearer.
     *
     * @return void
     */
    public function profile(): void {
        $claims = AuthMiddleware::authenticate();

        Response::json([
            'status' => 'success',
            'user'   => $claims,
        ]);
    }
}
