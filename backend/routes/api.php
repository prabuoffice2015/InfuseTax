<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| InfuseTax v2.0 REST API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Healthcheck & Tenant Config
    Route::get('/health', function () {
        return response()->json([
            'status'    => 'ok',
            'product'   => 'InfuseTax',
            'version'   => '2.0.0',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // 2. Authentication & Tenant Resolution
    Route::prefix('auth')->group(function () {
        Route::post('/login', 'Api\v1\AuthController@login');
        Route::post('/register', 'Api\v1\AuthController@register');
        Route::post('/logout', 'Api\v1\AuthController@logout')->middleware('auth:sanctum');
        Route::get('/me', 'Api\v1\AuthController@me')->middleware('auth:sanctum');
    });

    // 3. Authenticated Service Endpoints
    Route::middleware('auth:sanctum')->group(function () {
        // Multi-Tenant Company Management
        Route::prefix('company')->group(function () {
            Route::get('/settings', 'Api\v1\CompanyController@getSettings');
            Route::post('/branding', 'Api\v1\CompanyController@updateBranding');
            Route::get('/audit-ledger', 'Api\v1\CompanyController@getAuditLedger');
            Route::get('/utr-requests', 'Api\v1\CompanyController@getPendingUtrRequests');
            Route::post('/utr-requests/{id}/approve', 'Api\v1\CompanyController@approveUtrRequest');
            Route::post('/utr-requests/{id}/reject', 'Api\v1\CompanyController@rejectUtrRequest');
        });

        // Wallet & Ledger
        Route::prefix('wallet')->group(function () {
            Route::get('/balance', 'Api\v1\WalletController@getBalance');
            Route::get('/transactions', 'Api\v1\WalletController@getTransactions');
            Route::post('/request-topup', 'Api\v1\WalletController@requestTopup');
            Route::post('/transfer-p2p', 'Api\v1\WalletController@transferP2P');
        });

        // Tax & Compliance Desks
        Route::prefix('tax')->group(function () {
            Route::post('/gst-registration', 'Api\v1\TaxController@submitGstRegistration');
            Route::get('/gst-registrations', 'Api\v1\TaxController@listGstRegistrations');
            Route::post('/gstr-filing', 'Api\v1\TaxController@submitGstrFiling');
            Route::get('/gstr-filings', 'Api\v1\TaxController@listGstrFilings');
            Route::post('/itr-filing', 'Api\v1\TaxController@submitItrFiling');
            Route::get('/itr-filings', 'Api\v1\TaxController@listItrFilings');
            Route::post('/ai/form16-ocr', 'Api\v1\TaxController@processForm16Ocr');
            Route::post('/ai/tax-optimizer', 'Api\v1\TaxController@compareTaxRegimes');
        });

        // E-Governance Desks
        Route::prefix('egov')->group(function () {
            Route::post('/pan-apply', 'Api\v1\EgovController@submitPanApplication');
            Route::post('/passport-apply', 'Api\v1\EgovController@submitPassportApplication');
            Route::get('/passport-export-excel', 'Api\v1\EgovController@exportPassportBatchExcel');
            Route::get('/certificates/masters', 'Api\v1\EgovController@getCertificateMasters');
            Route::post('/certificates/apply', 'Api\v1\EgovController@submitCertificateApplication');
        });

        // Distributor Downline Network Management
        Route::prefix('network')->group(function () {
            Route::get('/retailers', 'Api\v1\WalletController@getDownlineRetailers');
            Route::post('/retailers', 'Api\v1\WalletController@onboardDownlineRetailer');
        });
    });
});
