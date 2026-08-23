<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Wallet {
    public static function getBalanceByUserId(string $userId): float {
        $pdo = Database::getConnection();
        if (!$pdo) return 0.00;

        try {
            $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = :uid LIMIT 1");
            $stmt->execute(['uid' => $userId]);
            $val = $stmt->fetchColumn();
            return $val !== false ? floatval($val) : 0.00;
        } catch (\Throwable $e) {
            return 0.00;
        }
    }

    public static function updateBalance(string $userId, float $newBalance): bool {
        $pdo = Database::getConnection();
        if (!$pdo) return false;

        try {
            $stmt = $pdo->prepare("UPDATE wallets SET balance = :bal, updated_at = NOW() WHERE user_id = :uid");
            return $stmt->execute(['bal' => $newBalance, 'uid' => $userId]);
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function transferP2P(string $senderId, string $receiverId, float $amount, string $tenantId, string $txnId): bool {
        $pdo = Database::getConnection();
        if (!$pdo || $amount <= 0) return false;

        try {
            $pdo->beginTransaction();

            // 1. Check sender balance
            $stmtSender = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = :uid FOR UPDATE");
            $stmtSender->execute(['uid' => $senderId]);
            $senderBal = floatval($stmtSender->fetchColumn());

            if ($senderBal < $amount) {
                $pdo->rollBack();
                return false;
            }

            // 2. Debit sender
            $newSenderBal = $senderBal - $amount;
            $pdo->prepare("UPDATE wallets SET balance = :b WHERE user_id = :u")->execute(['b' => $newSenderBal, 'u' => $senderId]);

            // 3. Credit receiver
            $stmtRec = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = :uid FOR UPDATE");
            $stmtRec->execute(['uid' => $receiverId]);
            $recBal = floatval($stmtRec->fetchColumn());
            $newRecBal = $recBal + $amount;
            $pdo->prepare("UPDATE wallets SET balance = :b WHERE user_id = :u")->execute(['b' => $newRecBal, 'u' => $receiverId]);

            // 4. Log Audit Ledger
            AuditLedger::log(
                tenantId: $tenantId,
                referenceId: $txnId,
                actorId: $senderId,
                actionType: 'P2P_DISBURSAL',
                debitUserId: $senderId,
                creditUserId: $receiverId,
                amount: $amount,
                balanceAfter: $newSenderBal,
                narration: "P2P Disbursal of INR {$amount}"
            );

            $pdo->commit();
            return true;
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            return false;
        }
    }
}
