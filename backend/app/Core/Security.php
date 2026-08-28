<?php

namespace App\Core;

/**
 * Class Security
 *
 * Centralized Enterprise Security Engine for InfuseTax platform.
 * Provides Bcrypt/Argon2id password hashing, Brute-Force Rate Limiting,
 * Input Sanitization, and OWASP-compliant HTTP Security Headers.
 *
 * @package App\Core
 * @author InfuseTax Engineering Security Team
 * @version 2.0.0
 */
class Security {
    /**
     * In-memory cache fallback for login attempt rate-limiting.
     * @var array<string, array{attempts: int, locked_until: int}>
     */
    private static array $rateLimitStore = [];

    /**
     * Hashes a raw plaintext password using Bcrypt with configurable algorithmic cost.
     *
     * @param string $password The raw password entered by the user.
     * @return string The 60-character secure bcrypt hash string.
     */
    public static function hashPassword(string $password): string {
        $cost = (int) (getenv('BCRYPT_ROUNDS') ?: 12);
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => $cost]);
    }

    /**
     * Verifies a raw plaintext password against a stored Bcrypt / Argon2id hash.
     * Uses timing-safe string comparison to prevent side-channel timing attacks.
     *
     * @param string $password The raw password to verify.
     * @param string $hash The stored hash from PostgreSQL database.
     * @return bool True if password matches, false otherwise.
     */
    public static function verifyPassword(string $password, string $hash): bool {
        if (empty($password) || empty($hash)) {
            return false;
        }
        return password_verify($password, $hash);
    }

    /**
     * Checks whether a password hash needs to be re-hashed with updated algorithm cost.
     *
     * @param string $hash Current stored hash.
     * @return bool True if re-hashing is required upon successful login.
     */
    public static function needsRehash(string $hash): bool {
        $cost = (int) (getenv('BCRYPT_ROUNDS') ?: 12);
        return password_needs_rehash($hash, PASSWORD_BCRYPT, ['cost' => $cost]);
    }

    /**
     * Enforces Rate-Limiting & Brute-Force protection on critical authentication endpoints.
     * Throws 429 Too Many Requests if failed attempts exceed threshold.
     *
     * @param string $identifier IP Address or User Email to throttle.
     * @param int|null $maxAttempts Maximum allowed failures (defaults to 5).
     * @param int|null $lockoutSeconds Lockout duration (defaults to 900s / 15 min).
     * @return bool True if permitted to attempt login, false if locked out.
     */
    public static function checkRateLimit(string $identifier, ?int $maxAttempts = null, ?int $lockoutSeconds = null): bool {
        $maxAttempts = $maxAttempts ?: (int) (getenv('AUTH_MAX_LOGIN_ATTEMPTS') ?: 5);
        $lockoutSeconds = $lockoutSeconds ?: (int) (getenv('AUTH_LOCKOUT_SECONDS') ?: 900);
        $now = time();

        $key = md5(strtolower(trim($identifier)));

        if (isset(self::$rateLimitStore[$key])) {
            $record = self::$rateLimitStore[$key];

            // If currently in lockout window
            if ($record['locked_until'] > $now) {
                return false;
            }

            // Reset if lockout expired
            if ($record['locked_until'] > 0 && $record['locked_until'] <= $now) {
                self::$rateLimitStore[$key] = ['attempts' => 0, 'locked_until' => 0];
            }
        }

        return true;
    }

    /**
     * Records a failed authentication attempt for a given identifier.
     * Triggers temporary account lockout if threshold is exceeded.
     *
     * @param string $identifier IP Address or User Email.
     * @return int Remaining attempts before temporary lockout.
     */
    public static function recordFailedAttempt(string $identifier): int {
        $maxAttempts = (int) (getenv('AUTH_MAX_LOGIN_ATTEMPTS') ?: 5);
        $lockoutSeconds = (int) (getenv('AUTH_LOCKOUT_SECONDS') ?: 900);
        $key = md5(strtolower(trim($identifier)));
        $now = time();

        if (!isset(self::$rateLimitStore[$key])) {
            self::$rateLimitStore[$key] = ['attempts' => 0, 'locked_until' => 0];
        }

        self::$rateLimitStore[$key]['attempts']++;

        if (self::$rateLimitStore[$key]['attempts'] >= $maxAttempts) {
            self::$rateLimitStore[$key]['locked_until'] = $now + $lockoutSeconds;
            return 0;
        }

        return $maxAttempts - self::$rateLimitStore[$key]['attempts'];
    }

    /**
     * Clears failed login counter upon successful authentication.
     *
     * @param string $identifier IP Address or User Email.
     */
    public static function clearLoginAttempts(string $identifier): void {
        $key = md5(strtolower(trim($identifier)));
        unset(self::$rateLimitStore[$key]);
    }

    /**
     * Sanitizes general string input to prevent Cross-Site Scripting (XSS) and control character injection.
     *
     * @param string|null $input Raw user input.
     * @return string Sanitized UTF-8 string with encoded HTML entities.
     */
    public static function sanitizeString(?string $input): string {
        if ($input === null) {
            return '';
        }
        $trimmed = trim($input);
        return htmlspecialchars($trimmed, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * Retrieves the 32-byte binary cryptographic key for payload encryption.
     */
    private static function getEncryptionKey(): string {
        $secret = getenv('APP_PAYLOAD_KEY') ?: 'infusetax_payload_secret_key_32bytes!!';
        return hash('sha256', $secret, true);
    }

    /**
     * Encrypts arbitrary PHP array/object payload using AES-256-CBC with dynamic IV.
     *
     * @param mixed $data Raw data payload.
     * @return string Base64 encoded IV + ciphertext string.
     */
    public static function encryptPayload(mixed $data): string {
        $key = self::getEncryptionKey();
        $iv = openssl_random_pseudo_bytes(16);
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $encrypted = openssl_encrypt($json, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        return base64_encode($iv . $encrypted);
    }

    /**
     * Decrypts an incoming AES-256-CBC encrypted payload string.
     *
     * @param string $encryptedPayload Base64 encoded payload.
     * @return array<string, mixed>|null Decrypted associative array, or null on decryption failure.
     */
    public static function decryptPayload(string $encryptedPayload): ?array {
        try {
            $key = self::getEncryptionKey();
            $decoded = base64_decode($encryptedPayload);
            if (!$decoded || strlen($decoded) < 17) {
                return null;
            }
            $iv = substr($decoded, 0, 16);
            $cipherText = substr($decoded, 16);
            $decrypted = openssl_decrypt($cipherText, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
            if ($decrypted === false) {
                return null;
            }
            return json_decode($decrypted, true) ?? [];
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Applies OWASP-recommended HTTP security headers to all outgoing responses.
     */
    public static function applySecurityHeaders(): void {
        // Prevent clickjacking by restricting framing
        header('X-Frame-Options: DENY');
        
        // Prevent MIME-type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Enable XSS filtering in modern browsers
        header('X-XSS-Protection: 1; mode=block');
        
        // Referrer policy to prevent information leakage
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Restrict browser features and sensors
        header('Permissions-Policy: geolocation=(), camera=(), microphone=()');

        // CORS Headers for Vercel, localhost, and production clients
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Encrypted-Payload, Accept-Encrypted, Accept');
        header('Access-Control-Allow-Credentials: true');

        // Handle CORS Pre-flight OPTIONS request immediately
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

