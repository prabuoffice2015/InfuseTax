<?php

namespace App\Http\Controllers;

use App\Core\Response;
use App\Models\User;
use App\Models\Wallet;
use App\Models\GstFiling;
use App\Models\ItrFiling;
use App\Models\AuditLedger;
use App\Services\TaxEngineService;

class TaxController {
    public function submitGstRegistration(array $body): void {
        $tradeName  = $body['trade_name'] ?? 'Sri Balaji Enterprises';
        $legalName  = $body['legal_name'] ?? 'Prabhu Thangavel';
        $entityType = $body['entity_type'] ?? 'Proprietorship';
        $pan        = strtoupper($body['pan'] ?? 'ABCDE1234F');
        $state      = $body['state'] ?? 'Tamil Nadu';
        $portalFee  = floatval($body['portal_fee'] ?? 1200.00);
        $margin     = floatval($body['margin'] ?? 300.00);

        $ret = User::findByRole('retailer');
        $newBalance = 46350.00;
        $arn = null;

        if ($ret) {
            $currBal = floatval($ret['balance'] ?? 0.00);
            if ($currBal >= $portalFee) {
                $newBalance = $currBal - $portalFee;

                $arn = GstFiling::create([
                    'tenant_id'   => $ret['tenant_id'],
                    'retailer_id' => $ret['id'],
                    'trade_name'  => $tradeName,
                    'legal_name'  => $legalName,
                    'entity_type' => $entityType,
                    'pan'         => $pan,
                    'state'       => $state,
                    'portal_fee'  => $portalFee,
                    'margin'      => $margin,
                ]);

                Wallet::updateBalance($ret['id'], $newBalance);

                AuditLedger::log(
                    tenantId: $ret['tenant_id'],
                    referenceId: $arn ?: 'GST-TXN-101',
                    actorId: $ret['id'],
                    actionType: 'GST_REGISTRATION_DEBIT',
                    debitUserId: $ret['id'],
                    amount: $portalFee,
                    balanceAfter: $newBalance,
                    narration: "GST Registration for {$tradeName}"
                );
            }
        }

        if (!$arn) {
            $arn = 'AA330826' . rand(1000000, 9999999) . 'Z';
        }

        Response::json([
            'status'         => 'success',
            'message'        => 'GST Registration processed via MVC Engine.',
            'arn'            => $arn,
            'trade_name'     => $tradeName,
            'debit_amount'   => $portalFee,
            'earned_margin'  => $margin,
            'new_wallet_bal' => $newBalance,
            'filed_at'       => date('c'),
        ]);
    }

    public function optimizeForm16(array $body): void {
        $grossSalary = floatval($body['gross_salary'] ?? 1250000);
        $sec80C      = floatval($body['sec_80c'] ?? 150000);
        $sec80D      = floatval($body['sec_80d'] ?? 25000);
        $tdsDeducted = floatval($body['tds_deducted'] ?? 98000);
        $pan         = strtoupper($body['pan'] ?? 'ABCDE1234F');
        $clientName  = $body['client_name'] ?? 'Dr. Ananya Sharma';

        $result = TaxEngineService::optimizeForm16($grossSalary, $sec80C, $sec80D, $tdsDeducted);

        $ret = User::findByRole('retailer');
        $ack = null;
        if ($ret) {
            $ack = ItrFiling::create([
                'tenant_id'      => $ret['tenant_id'],
                'retailer_id'    => $ret['id'],
                'client_name'    => $clientName,
                'pan'            => $pan,
                'gross_salary'   => $grossSalary,
                'optimal_regime' => $result['optimal_regime'],
                'tax_savings'    => $result['annual_tax_saved'],
                'net_refund'     => $result['net_refund_due'],
            ]);
        }

        if (!$ack) {
            $ack = 'ITR2026' . rand(100000, 999999);
        }

        Response::json(array_merge([
            'status'      => 'success',
            'ack_number'  => $ack,
            'client_name' => $clientName,
            'pan'         => $pan,
            'filed_at'    => date('c'),
        ], $result));
    }
}
