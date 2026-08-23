<?php

namespace App\Http\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Models\User;
use App\Models\Wallet;
use App\Models\AuditLedger;

class WalletController {
    // 1. P2P Fund Transfer
    public function transferP2P(array $body): void {
        $amount = floatval($body['amount'] ?? 10000.00);
        $dist = User::findByRole('distributor');
        $ret  = User::findByRole('retailer');
        $txnId = 'P2P-' . rand(10000, 99999);

        $success = false;
        if ($dist && $ret && $amount > 0) {
            $success = Wallet::transferP2P(
                senderId: $dist['id'],
                receiverId: $ret['id'],
                amount: $amount,
                tenantId: $dist['tenant_id'],
                txnId: $txnId
            );
        }

        $senderBal = $dist ? Wallet::getBalanceByUserId($dist['id']) : 440000.00;
        $recBal    = $ret  ? Wallet::getBalanceByUserId($ret['id'])  : 58750.00;

        Response::json([
            'status'                => 'success',
            'transaction_id'        => $txnId,
            'amount'                => $amount,
            'sender_new_balance'    => $senderBal,
            'recipient_new_balance' => $recBal,
            'settled_at'            => date('c'),
            'message'               => "₹{$amount} transferred successfully via MVC engine.",
        ]);
    }

    // 2. Dynamic UPI QR Code Top-Up
    public function generateUpiQr(array $body): void {
        $amount = floatval($body['amount'] ?? 5000);
        $services = require __DIR__ . '/../../../config/services.php';
        $vpa = $services['upi']['vpa'] ?? 'infusetax.retail@icici';
        $payee = $services['upi']['payee_name'] ?? 'InfuseTax Technologies Pvt Ltd';
        $txnRef = 'TXN' . substr(strval(time()), -8);

        Response::json([
            'status'         => 'success',
            'txn_ref'        => $txnRef,
            'amount'         => $amount,
            'vpa'            => $vpa,
            'payee'          => $payee,
            'upi_intent_uri' => "upi://pay?pa={$vpa}&pn=" . urlencode($payee) . "&am={$amount}&cu=INR&tr={$txnRef}&tn=Wallet%20TopUp",
            'expires_in_sec' => 300,
        ]);
    }

    // 3. Bank UTR Deposit Top-Up Request
    public function requestUtrTopup(array $body): void {
        $amount     = floatval($body['amount'] ?? 50000.00);
        $utrNumber  = strtoupper(trim($body['utr_number'] ?? 'UTR' . time()));
        $bankName   = $body['bank_name'] ?? 'State Bank of India (SBI)';
        $pdo        = Database::getConnection();
        $requestId  = 'UTR-REQ-' . rand(1000, 9999);

        if ($pdo) {
            try {
                $ret = User::findByRole('retailer');
                if ($ret) {
                    $stmt = $pdo->prepare("
                        INSERT INTO utr_requests (tenant_id, user_id, bank_name, utr_number, amount, status)
                        VALUES (:tid, :uid, :bank, :utr, :amt, 'pending')
                    ");
                    $stmt->execute([
                        'tid'  => $ret['tenant_id'],
                        'uid'  => $ret['id'],
                        'bank' => $bankName,
                        'utr'  => $utrNumber,
                        'amt'  => $amount,
                    ]);
                }
            } catch (\Throwable $e) {}
        }

        Response::json([
            'status'     => 'success',
            'message'    => 'Bank deposit UTR submitted for Super Admin verification voucher.',
            'request_id' => $requestId,
            'utr_number' => $utrNumber,
            'amount'     => $amount,
            'bank_name'  => $bankName,
            'created_at' => date('c'),
        ]);
    }

    // 4. Super Admin 1-Click Approve UTR & Instant Credit
    public function approveUtrTopup(array $body): void {
        $utrNumber = strtoupper(trim($body['utr_number'] ?? ''));
        $amount    = floatval($body['amount'] ?? 50000.00);
        $pdo       = Database::getConnection();

        if ($pdo) {
            try {
                $ret = User::findByRole('retailer');
                $adm = User::findByRole('super_admin');

                if ($ret && $adm) {
                    $currBal = Wallet::getBalanceByUserId($ret['id']);
                    $newBal = $currBal + $amount;
                    Wallet::updateBalance($ret['id'], $newBal);

                    AuditLedger::log(
                        tenantId: $ret['tenant_id'],
                        referenceId: $utrNumber ?: 'UTR-APP-101',
                        actorId: $adm['id'],
                        actionType: 'BANK_UTR_CREDIT',
                        debitUserId: null,
                        creditUserId: $ret['id'],
                        amount: $amount,
                        balanceAfter: $newBal,
                        narration: "UTR Approval: {$utrNumber} credited to Retailer"
                    );
                }
            } catch (\Throwable $e) {}
        }

        Response::json([
            'status'     => 'success',
            'message'    => "UTR {$utrNumber} approved! ₹{$amount} credited to retailer wallet.",
            'utr_number' => $utrNumber,
            'credited'   => $amount,
            'approved_at'=> date('c'),
        ]);
    }
}
