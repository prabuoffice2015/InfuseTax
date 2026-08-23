<?php

use App\Core\Router;

/*
|--------------------------------------------------------------------------
| InfuseTax Enterprise API Routes (MVC Pattern)
|--------------------------------------------------------------------------
*/

// Healthcheck
Router::get('/api/v1/health', 'HealthController@check');
Router::get('/api/health', 'HealthController@check');
Router::get('/health', 'HealthController@check');

// Authentication
Router::post('/api/v1/auth/login', 'AuthController@login');

// Tax & Compliance Desks
Router::post('/api/v1/tax/gst-registration', 'TaxController@submitGstRegistration');
Router::post('/api/v1/tax/ai/form16-ocr', 'TaxController@optimizeForm16');

// Prepaid Wallet & P2P Engine
Router::post('/api/v1/wallet/transfer-p2p', 'WalletController@transferP2P');
Router::post('/api/v1/wallet/topup-upi', 'WalletController@generateUpiQr');

// Government Sandboxes
Router::post('/api/v1/government/verify-pan', 'GovernmentController@verifyPan');
Router::post('/api/v1/government/verify-gstin', 'GovernmentController@verifyGstin');

// Portal Analytics & Stats
Router::get('/api/v1/dashboard/stats', 'DashboardController@getStats');
