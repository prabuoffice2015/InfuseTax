<?php

namespace App\Models;

use App\Core\Database;

class ItrFiling {
    public static function create(array $data): ?string {
        $pdo = Database::getConnection();
        if (!$pdo) return null;

        try {
            $ackNumber = 'ITR2026' . rand(100000, 999999);
            $stmt = $pdo->prepare("
                INSERT INTO itr_filings (tenant_id, retailer_id, ack_number, client_name, pan, gross_salary, optimal_regime, tax_savings, net_refund, status)
                VALUES (:tid, :rid, :ack, :client, :pan, :gross, :regime, :savings, :refund, 'FILED_VERIFIED')
            ");
            $res = $stmt->execute([
                'tid'     => $data['tenant_id'],
                'rid'     => $data['retailer_id'],
                'ack'     => $ackNumber,
                'client'  => $data['client_name'],
                'pan'     => $data['pan'],
                'gross'   => $data['gross_salary'],
                'regime'  => $data['optimal_regime'] ?? 'NEW_REGIME_BUDGET_2025_26',
                'savings' => $data['tax_savings'] ?? 0.00,
                'refund'  => $data['net_refund'] ?? 0.00,
            ]);
            return $res ? $ackNumber : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
