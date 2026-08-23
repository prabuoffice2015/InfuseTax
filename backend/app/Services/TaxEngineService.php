<?php

namespace App\Services;

class TaxEngineService {
    public static function optimizeForm16(float $grossSalary, float $sec80C = 150000, float $sec80D = 25000, float $tdsDeducted = 98000): array {
        $stdDeduction = 75000; // Budget 2025-26 New Regime

        // 1. Old Regime Calculation
        $oldTaxable = max(0, $grossSalary - 50000 - $sec80C - $sec80D);
        $oldTax = 0;
        if ($oldTaxable > 1000000) {
            $oldTax = 112500 + ($oldTaxable - 1000000) * 0.30;
        } elseif ($oldTaxable > 500000) {
            $oldTax = 12500 + ($oldTaxable - 500000) * 0.20;
        } elseif ($oldTaxable > 250000) {
            $oldTax = ($oldTaxable - 250000) * 0.05;
        }
        $oldTaxWithCess = $oldTax * 1.04;

        // 2. New Regime Calculation (Budget 2025-26 Slabs)
        $newTaxable = max(0, $grossSalary - $stdDeduction);
        $newTax = 0;
        if ($newTaxable > 1500000) {
            $newTax = 140000 + ($newTaxable - 1500000) * 0.30;
        } elseif ($newTaxable > 1200000) {
            $newTax = 80000 + ($newTaxable - 1200000) * 0.20;
        } elseif ($newTaxable > 1000000) {
            $newTax = 50000 + ($newTaxable - 1000000) * 0.15;
        } elseif ($newTaxable > 700000) {
            $newTax = 20000 + ($newTaxable - 700000) * 0.10;
        } elseif ($newTaxable > 300000) {
            $newTax = ($newTaxable - 300000) * 0.05;
        }

        // Section 87A rebate for income up to ₹7,00,000 (effective ₹7.75L gross)
        if ($newTaxable <= 700000) {
            $newTax = 0;
        }
        $newTaxWithCess = $newTax * 1.04;

        $taxSaved = max(0, $oldTaxWithCess - $newTaxWithCess);
        $netRefund = max(0, $tdsDeducted - $newTaxWithCess);

        return [
            'gross_salary'       => $grossSalary,
            'standard_deduction' => $stdDeduction,
            'old_regime_tax'     => round($oldTaxWithCess, 2),
            'new_regime_tax'     => round($newTaxWithCess, 2),
            'optimal_regime'     => 'NEW REGIME (Budget 2025-26)',
            'annual_tax_saved'   => round($taxSaved, 2),
            'net_refund_due'     => round($netRefund, 2),
        ];
    }
}
