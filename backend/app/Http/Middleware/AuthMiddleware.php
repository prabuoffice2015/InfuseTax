<?php

namespace App\Http\Middleware;

use App\Core\Jwt;
use App\Core\Response;

/**
 * Class AuthMiddleware
 *
 * Intercepts incoming HTTP requests to validate JWT Bearer authentication tokens.
 * Injects verified user claims into the application request context.
 *
 * @package App\Http\Middleware
 * @author InfuseTax Engineering Security Team
 * @version 2.0.0
 */
class AuthMiddleware {
    /**
     * Authenticated user session context.
     * @var array<string, mixed>|null
     */
    private static ?array $authenticatedUser = null;

    /**
     * Handles incoming request authentication.
     * Extracts token from 'Authorization: Bearer <token>' header.
     *
     * @return array<string, mixed> Decoded claims payload of authenticated user.
     */
    public static function authenticate(): array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
            Response::error('Unauthorized: Missing or malformed Bearer token.', 401);
        }

        $token = $matches[1];
        $claims = Jwt::decode($token);

        if ($claims === null) {
            Response::error('Unauthorized: Invalid, expired, or tampered token. Please re-authenticate.', 401);
        }

        self::$authenticatedUser = $claims;
        return $claims;
    }

    /**
     * Retrieves currently authenticated user claims.
     *
     * @return array<string, mixed>|null
     */
    public static function user(): ?array {
        return self::$authenticatedUser;
    }

    /**
     * Returns the user ID of the active authenticated session.
     *
     * @return string|null
     */
    public static function id(): ?string {
        return self::$authenticatedUser['sub'] ?? self::$authenticatedUser['id'] ?? null;
    }

    /**
     * Returns the role of the active authenticated session.
     *
     * @return string|null
     */
    public static function role(): ?string {
        return self::$authenticatedUser['role'] ?? null;
    }
}
