<?php

namespace App\Http\Controllers;

use App\Core\Response;
use App\Models\User;

class AuthController {
    public function login(array $body): void {
        $identifier = trim($body['identifier'] ?? '');
        $password   = trim($body['password'] ?? '');

        if (empty($identifier)) {
            Response::error('Identifier (Email/Mobile) is required.', 422);
        }

        $user = User::findByIdentifier($identifier);

        if ($user) {
            Response::json([
                'status' => 'success',
                'token'  => 'jwt_' . bin2hex(random_bytes(24)),
                'user'   => [
                    'id'      => $user['id'],
                    'name'    => $user['full_name'],
                    'email'   => $user['email'],
                    'role'    => $user['role'],
                    'tenant'  => $user['tenant_code'] ?? 'INFUSE',
                    'city'    => $user['city'],
                    'state'   => $user['state'],
                    'wallet'  => floatval($user['wallet_balance'] ?? 0.00),
                ],
            ]);
        }

        // Fallback default mock user
        $role = 'retailer';
        $name = 'Ramesh Digital Seva (Retailer)';
        $wallet = 47550.00;

        if (str_contains($identifier, 'admin')) {
            $role = 'super_admin';
            $name = 'InfuseTax Super Admin';
            $wallet = 2500000.00;
        } elseif (str_contains($identifier, 'distributor')) {
            $role = 'distributor';
            $name = 'Apex Zonal Distributor';
            $wallet = 450000.00;
        } elseif (str_contains($identifier, 'operator')) {
            $role = 'operator';
            $name = 'Counter Staff (Operator)';
            $wallet = 15400.00;
        }

        Response::json([
            'status' => 'success',
            'token'  => 'jwt_' . bin2hex(random_bytes(24)),
            'user'   => [
                'id'     => 'b0000000-0000-0000-0000-000000000003',
                'name'   => $name,
                'email'  => $identifier,
                'role'   => $role,
                'tenant' => 'INFUSE',
                'wallet' => $wallet,
            ],
        ]);
    }
}
