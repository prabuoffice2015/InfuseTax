<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Accounts Table (Digital Wallets)
        Schema::create('accounts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id')->unique();
            $table->decimal('wallet_amount', 14, 2)->default(0.00);
            $table->decimal('locked_amount', 14, 2)->default(0.00);
            $table->decimal('credit_limit', 14, 2)->default(0.00);
            $table->smallInteger('status')->default(0); // 0: Active, 1: Frozen
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // Add PostgreSQL non-negative balance constraint
        DB::statement('ALTER TABLE accounts ADD CONSTRAINT chk_wallet_amount_non_negative CHECK (wallet_amount >= 0.00)');
        DB::statement('ALTER TABLE accounts ADD CONSTRAINT chk_locked_amount_non_negative CHECK (locked_amount >= 0.00)');

        // 2. Wallet Topup Requests Table (UTR Manual Deposits & Payment Gateway)
        Schema::create('wallet_requests', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->string('trans_code', 50)->unique(); // TOPUP0001
            $table->string('utr_ref_no', 100)->nullable();
            $table->string('deposit_bank', 100)->nullable();
            $table->decimal('amount', 14, 2);
            $table->smallInteger('payment_type')->default(1); // 1: Bank UTR, 2: Online PG
            $table->smallInteger('status')->default(0); // 0: Pending, 1: Approved, 2: Rejected
            $table->unsignedBigInteger('approved_by_user_id')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('approved_by_user_id')->references('id')->on('users')->onDelete('set null');
        });

        // 3. Double-Entry Transactions Ledger Table
        Schema::create('transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('operator_user_id')->nullable(); // Employee / Counter staff who triggered
            $table->unsignedSmallInteger('service_id'); // 1: Topup, 2: GST Reg, 3: GSTR-1, 4: GSTR-3B, 5: ITR, 6: PAN, 7: Passport, 8: Dynamic Cert, 9: P2P Transfer
            $table->string('reference_id', 100)->nullable(); // Primary service record ID
            $table->enum('trans_type', ['CREDIT', 'DEBIT']);
            $table->decimal('current_amt', 14, 2);
            $table->decimal('trans_amt', 14, 2);
            $table->decimal('retailer_comm', 10, 2)->default(0.00);
            $table->decimal('distributor_comm', 10, 2)->default(0.00);
            $table->decimal('company_margin', 10, 2)->default(0.00);
            $table->decimal('bal_amt', 14, 2);
            $table->string('service_desc', 255);
            $table->smallInteger('trans_status')->default(1); // 1: Success, 0: Failed, 2: Reversed
            $table->string('idempotency_key', 100)->nullable()->unique();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('restrict');
            $table->foreign('operator_user_id')->references('id')->on('users')->onDelete('set null');

            $table->index(['user_id', 'created_at']);
            $table->index(['company_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('wallet_requests');
        Schema::dropIfExists('accounts');
    }
};
