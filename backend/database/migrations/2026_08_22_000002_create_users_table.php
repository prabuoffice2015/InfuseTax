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
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('parent_user_id')->nullable(); // Sponsor / Distributor Link
            $table->string('user_code', 50)->unique(); // INF001, RET1029, EMP05
            $table->string('name', 191);
            $table->string('shop_name', 255)->nullable();
            $table->string('email', 191);
            $table->string('mobile_no', 20);
            $table->string('password', 255);
            
            // 4-Tier Multi-Tenant Hierarchy
            $table->unsignedSmallInteger('hierarchy_tier')->default(3); // 1: Company Staff, 2: Customer/Distributor, 3: Retailer, 4: Employee
            $table->string('customer_type', 50)->nullable(); // 'master_distributor', 'regional_distributor', 'corporate_partner', 'tax_franchise'
            $table->string('role_type', 50)->default('retailer'); // 'super_admin', 'accountant', 'sales', 'support', 'customer_admin', 'store_owner', 'counter_operator'
            $table->jsonb('permissions')->default('[]');
            
            // KYC & Profile
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('pincode', 10)->nullable();
            $table->string('aadhar_no', 20)->nullable();
            $table->string('pan_no', 20)->nullable();
            
            // Status & Verification
            $table->smallInteger('is_status')->default(1); // 0: Pending, 1: Active, 2: Suspended
            $table->boolean('is_verified')->default(false);
            $table->rememberToken();
            $table->timestamps();

            // Foreign Keys & Indexes
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('parent_user_id')->references('id')->on('users')->onDelete('set null');
            
            $table->index('company_id');
            $table->index('parent_user_id');
            $table->index('hierarchy_tier');
            $table->index('role_type');
            $table->unique(['company_id', 'email']);
            $table->unique(['company_id', 'mobile_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
