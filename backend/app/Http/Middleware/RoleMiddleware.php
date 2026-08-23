<?php

namespace App\Http\Middleware;

use App\Core\Response;

/**
 * Class RoleMiddleware
 *
 * Enforces Role-Based Access Control (RBAC) across protected platform routes.
 * Blocks unauthorized users with 403 Forbidden status.
 *
 * @package App\Http\Middleware
 * @author InfuseTax Engineering Security Team
 * @version 2.0.0
 */
class RoleMiddleware {
    /**
     * Enforces that the current authenticated user has one of the allowed roles.
     *
     * @param array<string> $allowedRoles List of permissible role strings (e.g. ['super_admin']).
     * @return void
     */
    public static function authorize(array $allowedRoles): void {
        $user = AuthMiddleware::authenticate();
        $userRole = $user['role'] ?? '';

        if (!in_array($userRole, $allowedRoles, true)) {
            Response::error(
                message: "Access Denied: Role '{$userRole}' lacks required permissions for this action.",
                statusCode: 403,
                errors: ['required_roles' => $allowedRoles, 'your_role' => $userRole]
            );
        }
    }
}
