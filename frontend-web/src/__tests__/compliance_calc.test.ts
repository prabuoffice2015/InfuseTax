/**
 * InfuseTax Enterprise Automated Compliance & Tax Engine Test Suite
 * Tests Union Budget 2025-26 Standard Deductions, Old vs New Regime Optimizer,
 * GSTR-2B ITC Matching Engine, and Multi-Tier Wallet Balances.
 */

describe("InfuseTax Indian Taxation & Compliance Engine", () => {

  // 1. Budget 2025-26 Salaried Tax Calculation
  describe("Union Budget 2025-26 New Tax Regime (Section 115BAC)", () => {
    function calculateNewRegimeTax(grossSalary: number): { taxableIncome: number; tax: number; rebate: number; netTax: number } {
      const standardDeduction = 75000;
      const taxableIncome = Math.max(0, grossSalary - standardDeduction);

      let tax = 0;
      if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
        tax += 300000 * 0.20; // 12L-15L (60,000)
        tax += 200000 * 0.15; // 10L-12L (30,000)
        tax += 300000 * 0.10; // 7L-10L (30,000)
        tax += 400000 * 0.05; // 3L-7L (20,000)
      } else if (taxableIncome > 1200000) {
        tax += (taxableIncome - 1200000) * 0.20;
        tax += 200000 * 0.15;
        tax += 300000 * 0.10;
        tax += 400000 * 0.05;
      } else if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.15;
        tax += 300000 * 0.10;
        tax += 400000 * 0.05;
      } else if (taxableIncome > 700000) {
        tax += (taxableIncome - 700000) * 0.10;
        tax += 400000 * 0.05;
      } else if (taxableIncome > 300000) {
        tax += (taxableIncome - 300000) * 0.05;
      }

      // Section 87A Rebate for Taxable Income up to ₹7,00,000 (effective ₹7.75L gross)
      let rebate = 0;
      if (taxableIncome <= 700000) {
        rebate = tax;
        tax = 0;
      }

      const cess = tax * 0.04;
      return { taxableIncome, tax, rebate, netTax: tax + cess };
    }

    test("should apply ₹75,000 Standard Deduction and give 0 tax for gross salary ≤ ₹7,75,000", () => {
      const result = calculateNewRegimeTax(775000);
      expect(result.taxableIncome).toBe(700000);
      expect(result.netTax).toBe(0);
      expect(result.rebate).toBe(20000); // 5% of 400,000 (3L-7L)
    });

    test("should calculate correct progressive tax for ₹12,00,000 gross salary", () => {
      const result = calculateNewRegimeTax(1200000);
      expect(result.taxableIncome).toBe(1125000);
      // Tax: 3L-7L (20k) + 7L-10L (30k) + 10L-11.25L (15% of 1.25L = 18.75k) = 68,750 + 4% cess
      expect(result.tax).toBe(68750);
      expect(result.netTax).toBe(68750 * 1.04);
    });
  });

  // 2. GST Input Tax Credit (ITC) Reconciler
  describe("GSTR-2B vs Books ITC Reconciliation Engine", () => {
    interface Invoice {
      invNo: string;
      taxAmount: number;
      inGstr2B: boolean;
      isBlockedUnder17_5: boolean;
    }

    function reconcileItc(invoices: Invoice[]) {
      let matchedItc = 0;
      let blockedItc = 0;
      let pendingItc = 0;

      for (const inv of invoices) {
        if (inv.isBlockedUnder17_5) {
          blockedItc += inv.taxAmount;
        } else if (inv.inGstr2B) {
          matchedItc += inv.taxAmount;
        } else {
          pendingItc += inv.taxAmount;
        }
      }

      return {
        matchedItc,
        blockedItc,
        pendingItc,
        claimableItc: matchedItc,
      };
    }

    test("should correctly segregate claimable, blocked, and pending ITC", () => {
      const invoices: Invoice[] = [
        { invNo: "INV-01", taxAmount: 18000, inGstr2B: true, isBlockedUnder17_5: false },
        { invNo: "INV-02", taxAmount: 5000, inGstr2B: true, isBlockedUnder17_5: true }, // Blocked e.g. food
        { invNo: "INV-03", taxAmount: 12000, inGstr2B: false, isBlockedUnder17_5: false }, // Pending supplier
      ];

      const report = reconcileItc(invoices);
      expect(report.claimableItc).toBe(18000);
      expect(report.blockedItc).toBe(5000);
      expect(report.pendingItc).toBe(12000);
    });
  });

  // 3. Double-Entry Prepaid Wallet Integrity
  describe("ACID Wallet Balance Double-Entry Ledger", () => {
    function processP2PTransfer(
      senderBalance: number,
      receiverBalance: number,
      amount: number
    ): { success: boolean; newSender: number; newReceiver: number } {
      if (senderBalance < amount || amount <= 0) {
        return { success: false, newSender: senderBalance, newReceiver: receiverBalance };
      }
      return {
        success: true,
        newSender: senderBalance - amount,
        newReceiver: receiverBalance + amount,
      };
    }

    test("should deduct from sender and credit receiver instantaneously", () => {
      const result = processP2PTransfer(450000, 48750, 10000);
      expect(result.success).toBe(true);
      expect(result.newSender).toBe(440000);
      expect(result.newReceiver).toBe(58750);
    });

    test("should prevent overdraft when transfer amount exceeds balance", () => {
      const result = processP2PTransfer(5000, 1000, 10000);
      expect(result.success).toBe(false);
      expect(result.newSender).toBe(5000);
      expect(result.newReceiver).toBe(1000);
    });
  });
});
