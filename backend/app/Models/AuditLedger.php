<?php

namespace App\Models;

use App\Core\Database;

class AuditLedger {
    public static function log(
        string $tenantId,
        string $referenceId,
        ?string $actorId,
        string $actionType,
        ?string $debitUserId = null,
        ?string $creditUserId = null,
        float $amount = 0.00,
        float $balanceAfter = 0.00,
        string $narration = ''
    ): bool {
        $pdo = Database::getConnection();
        if (!$pdo) return false;

        try {
            $stmt = $pdo->prepare("
                INSERT INTO audit_ledger (tenant_id, reference_id, actor_id, action_type, debit_user_id, credit_user_id, amount, balance_after, narration)
                VALUES (:tid, :ref, :actor, :act, :deb, :cred, :amt, :bal, :narr)
            ");
            return $stmt->execute([
                'tid'   => $tenantId,
                'ref'   => $referenceId,
                'actor' => $actorId,
                'act'   => $actionType,
                'deb'   => $debitUserId,
                'cred'  => $creditUserId,
                'amt'   => $amount,
                'bal'   => $balanceAfter,
                'narr'  => $narration,
            ]);
        } catch (\Throwable $e) {
            return false;
        }
    }
}
