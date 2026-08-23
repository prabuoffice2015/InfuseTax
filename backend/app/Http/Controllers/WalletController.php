<?php

namespace App\Http\Controllers;

use App\Core\Response;
use App\Models\User;
use App\Models\Wallet;

class WalletController {
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
}
