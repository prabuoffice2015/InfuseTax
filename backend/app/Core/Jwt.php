<?php

namespace App\Core;

/**
 * Class Jwt
 *
 * Cryptographically secure JSON Web Token (JWT) implementation using HMAC-SHA256 (HS256).
 * Provides RFC 7519 compliant token signing, tampering detection, and claims validation.
 *
 * @package App\Core
 * @author InfuseTax Engineering Security Team
 * @version 2.0.0
 */
class Jwt {
    /**
     * Algorithm identifier for token header.
     */
    private const ALGORITHM = 'HS256';

    /**
     * Generates a signed JWT string from a given payload array.
     *
     * @param array<string, mixed> $payload Custom claims including user_id, role, tenant, etc.
     * @param int|null $expirySeconds Token validity duration in seconds (defaults to JWT_EXPIRATION_SECONDS or 24h).
     * @param string|null $secret Custom secret key or default from environment.
     * @return string URL-safe Base64-encoded JWT token string.
     */
    public static function encode(array $payload, ?int $expirySeconds = null, ?string $secret = null): string {
        $secret = $secret ?: (getenv('JWT_SECRET') ?: 'infusetax_default_secure_key_2026');
        $expiry = $expirySeconds ?: (int) (getenv('JWT_EXPIRATION_SECONDS') ?: 86400);

        // Standard RFC 7519 Claims
        $now = time();
        $claims = array_merge([
            'iss' => 'infusetax-auth-engine',
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $expiry,
            'jti' => bin2hex(random_bytes(16)),
        ], $payload);

        $header = [
            'typ' => 'JWT',
            'alg' => self::ALGORITHM,
        ];

        $encodedHeader  = self::base64UrlEncode((string) json_encode($header));
        $encodedPayload = self::base64UrlEncode((string) json_encode($claims));

        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    /**
     * Decodes and validates a JWT token string.
     * Checks signature integrity and expiration status using timing-attack resistant comparisons.
     *
     * @param string $token The JWT token string from Authorization header.
     * @param string|null $secret Custom secret key or default from environment.
     * @return array<string, mixed>|null Returns claims array if valid, or null if tampered/expired.
     */
    public static function decode(string $token, ?string $secret = null): ?array {
        $secret = $secret ?: (getenv('JWT_SECRET') ?: 'infusetax_default_secure_key_2026');
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        // 1. Validate Signature using timing-safe hash_equals
        $expectedSignature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $providedSignature = self::base64UrlDecode($encodedSignature);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            return null; // Signature mismatch / Tampered token
        }

        // 2. Decode Header & Verify Algorithm
        $header = json_decode(self::base64UrlDecode($encodedHeader), true);
        if (!$header || ($header['alg'] ?? '') !== self::ALGORITHM) {
            return null;
        }

        // 3. Decode Payload Claims
        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!$payload || !is_array($payload)) {
            return null;
        }

        // 4. Verify Expiration Time (exp)
        $now = time();
        if (isset($payload['exp']) && $now > (int) $payload['exp']) {
            return null; // Expired Token
        }

        // 5. Verify Not-Before Time (nbf)
        if (isset($payload['nbf']) && $now < (int) $payload['nbf']) {
            return null; // Token not yet active
        }

        return $payload;
    }

    /**
     * URL-safe Base64 encoding according to RFC 4648.
     *
     * @param string $data Raw binary or text string.
     * @return string Safe Base64 string without trailing '=' padding.
     */
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decodes a URL-safe Base64 string back to raw content.
     *
     * @param string $data Base64 URL-encoded string.
     * @return string Decoded raw string.
     */
    private static function base64UrlDecode(string $data): string {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }
}
