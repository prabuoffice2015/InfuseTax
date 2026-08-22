<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. GST Registration Applications
        Schema::create('gst_registrations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('operator_user_id')->nullable();
            $table->string('application_no', 50)->unique(); // GSTREG0001
            $table->string('trade_name', 255);
            $table->string('legal_name', 255)->nullable();
            $table->string('business_type', 50); // proprietorship, partnership, llp, pvt_ltd, opc
            $table->string('pan_no', 20);
            $table->string('mobile_no', 20);
            $table->string('email', 191);
            $table->text('address');
            $table->string('state', 100);
            $table->string('pincode', 10);
            $table->jsonb('uploaded_proofs')->default('{}'); // PAN, Aadhaar, Electricity Bill, Rent NOC, Bank Proof
            $table->string('trn_number', 50)->nullable();
            $table->string('arn_number', 50)->nullable();
            $table->string('gstin_number', 20)->nullable();
            $table->string('gst_certificate_url', 500)->nullable();
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->smallInteger('status')->default(0); // 0: Pending, 1: Processed/Approved, 2: Rejected
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('operator_user_id')->references('id')->on('users')->onDelete('set null');
        });

        // 2. GST Return Filings (GSTR-1, GSTR-3B, CMP-08)
        Schema::create('gst_returns', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('operator_user_id')->nullable();
            $table->string('filing_code', 50)->unique();
            $table->string('gstin', 20);
            $table->string('return_type', 20); // GSTR-1, GSTR-3B, CMP-08, GSTR-9
            $table->string('financial_year', 15); // e.g. 2024-2025
            $table->string('filing_period', 20); // e.g. July 2024 / Q2 2024
            $table->decimal('total_turnover', 14, 2)->default(0.00);
            $table->decimal('tax_payable', 14, 2)->default(0.00);
            $table->decimal('itc_claimed', 14, 2)->default(0.00);
            $table->jsonb('sales_invoices_data')->default('[]');
            $table->jsonb('itc_reconciliation_meta')->default('{}'); // AI Anomaly / GSTR-2B matching results
            $table->string('portal_acknowledgment_url', 500)->nullable();
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->smallInteger('status')->default(0); // 0: Pending, 1: Filed/Completed, 2: Rejected
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // 3. Income Tax Return (ITR) Filings
        Schema::create('itr_filings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('operator_user_id')->nullable();
            $table->string('acknowledgment_code', 50)->unique();
            $table->string('pan_no', 20);
            $table->string('assessment_year', 15); // e.g. 2025-2026
            $table->string('itr_type', 20); // ITR-1, ITR-2, ITR-4
            $table->string('tax_regime', 20)->default('NEW'); // OLD / NEW
            $table->decimal('gross_total_income', 14, 2)->default(0.00);
            $table->decimal('total_deductions', 14, 2)->default(0.00);
            $table->decimal('tax_payable_or_refund', 14, 2)->default(0.00);
            $table->jsonb('form16_ocr_extracted_data')->default('{}'); // AI Form 16 JSON
            $table->jsonb('uploaded_documents')->default('{}'); // Form 16 PDF, Bank Statements, 26AS
            $table->string('itr_v_slip_url', 500)->nullable();
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->smallInteger('status')->default(0); // 0: Pending, 1: Filed, 2: Rejected
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // 4. PAN Card Applications
        Schema::create('pan_applications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->string('application_code', 50)->unique();
            $table->string('pan_type', 50); // New_49A, Correction, Duplicate
            $table->string('applicant_name', 191);
            $table->string('father_name', 191)->nullable();
            $table->date('dob')->nullable();
            $table->string('aadhar_no', 20)->nullable();
            $table->jsonb('uploaded_proofs')->default('{}');
            $table->string('acknowledgment_slip_url', 500)->nullable();
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->smallInteger('status')->default(0);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // 5. Passport Applications
        Schema::create('passport_applications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->string('application_code', 50)->unique();
            $table->string('passport_type', 50); // Fresh, Reissue, PCC
            $table->string('scheme_type', 50)->default('Normal'); // Normal, Tatkaal
            $table->string('given_name', 100);
            $table->string('surname', 100)->nullable();
            $table->string('place_of_birth', 100)->nullable();
            $table->string('police_station', 150)->nullable();
            $table->string('file_no', 100)->nullable();
            $table->jsonb('uploaded_proofs')->default('{}');
            $table->string('appointment_slip_url', 500)->nullable();
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->smallInteger('status')->default(0);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // 6. Dynamic Certificate Master & Applications
        Schema::create('certificate_masters', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('company_id');
            $table->string('route_slug', 100);
            $table->string('name', 255);
            $table->string('title', 255)->nullable();
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->jsonb('required_documents')->default('[]');
            $table->jsonb('form_schema')->default('[]');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
        });

        Schema::create('certificate_applications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('certificate_master_id');
            $table->string('application_code', 50)->unique();
            $table->jsonb('application_data')->default('{}');
            $table->jsonb('uploaded_documents')->default('{}');
            $table->string('verified_certificate_url', 500)->nullable();
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->smallInteger('status')->default(0);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('certificate_master_id')->references('id')->on('certificate_masters')->onDelete('restrict');
        });

        // 7. P2P Money Transfer Logs (Parent Distributor -> Child Retailer)
        Schema::create('share_money_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('sender_user_id');
            $table->unsignedBigInteger('recipient_user_id');
            $table->decimal('amount', 14, 2);
            $table->string('remarks', 255)->nullable();
            $table->smallInteger('status')->default(1);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('sender_user_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('recipient_user_id')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('share_money_logs');
        Schema::dropIfExists('certificate_applications');
        Schema::dropIfExists('certificate_masters');
        Schema::dropIfExists('passport_applications');
        Schema::dropIfExists('pan_applications');
        Schema::dropIfExists('itr_filings');
        Schema::dropIfExists('gst_returns');
        Schema::dropIfExists('gst_registrations');
    }
};
