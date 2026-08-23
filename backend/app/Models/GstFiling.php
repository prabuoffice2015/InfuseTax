<?php

namespace App\Models;

use App\Core\Database;

class GstFiling {
    public static function create(array $data): ?string {
        $pdo = Database::getConnection();
        if (!$pdo) return null;

        try {
            $arn = 'AA330826' . rand(1000000, 9999999) . 'Z';
            $stmt = $pdo->prepare("
                INSERT INTO gst_filings (tenant_id, retailer_id, arn, trade_name, legal_name, entity_type, pan, state, portal_fee, retailer_margin, status)
                VALUES (:tid, :rid, :arn, :trade, :legal, :type, :pan, :state, :fee, :margin, 'ARN_GENERATED')
            ");
            $res = $stmt->execute([
                'tid'    => $data['tenant_id'],
                'rid'    => $data['retailer_id'],
                'arn'    => $arn,
                'trade'  => $data['trade_name'],
                'legal'  => $data['legal_name'],
                'type'   => $data['entity_type'] ?? 'Proprietorship',
                'pan'    => $data['pan'],
                'state'  => $data['state'] ?? 'Tamil Nadu',
                'fee'    => $data['portal_fee'] ?? 1200.00,
                'margin' => $data['margin'] ?? 300.00,
            ]);
            return $res ? $arn : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
