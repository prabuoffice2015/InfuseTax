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
        Schema::create('companies', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique();
            $table->string('name', 255);
            $table->string('code', 50)->unique(); // e.g. INFUSE, TAXPRO
            $table->string('domain', 255)->nullable()->unique();
            $table->string('subdomain', 100)->nullable()->unique();
            $table->string('logo_url', 500)->nullable()->default('/brand/infusetax_logo_600x200.png');
            $table->string('favicon_url', 500)->nullable()->default('/brand/favicon.ico');
            $table->jsonb('brand_colors')->default('{"primary": "#1E40AF", "secondary": "#F59E0B", "accent": "#10B981"}');
            $table->string('sms_sender_id', 20)->nullable()->default('INFUST');
            $table->jsonb('invoice_settings')->default('{"show_gst": true, "footer_text": "Thank you for using InfuseTax"}');
            $table->jsonb('feature_flags')->default('{"pan": true, "passport": true, "gst": true, "itr": true, "certificates": true, "ai_ocr": true, "ai_tax_optimizer": true}');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('domain');
            $table->index('subdomain');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
