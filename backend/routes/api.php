<?php

use App\Core\Router;

/*
|--------------------------------------------------------------------------
| InfuseTax Enterprise API Routes (Complete 100% MVC REST Suite)
|--------------------------------------------------------------------------
*/

// 1. Healthcheck
Router::get('/api/v1/health', 'HealthController@check');
Router::get('/api/health', 'HealthController@check');
Router::get('/health', 'HealthController@check');

// 2. Authentication & Session
Router::post('/api/v1/auth/login', 'AuthController@login');
Router::get('/api/v1/auth/profile', 'AuthController@profile');

// 3. Tax, GST, ITR & Compliance Desks
Router::post('/api/v1/tax/gst-registration', 'TaxController@submitGstRegistration');
Router::post('/api/v1/tax/ai/form16-ocr', 'TaxController@optimizeForm16');
Router::post('/api/v1/tax/pan-application', 'TaxController@submitPanApplication');
Router::post('/api/v1/tax/passport-application', 'TaxController@submitPassportApplication');
Router::post('/api/v1/tax/generate-certificate', 'TaxController@generateCertificate');
Router::get('/api/v1/filings/recent', 'TaxController@getRecentFilings');

// 4. Prepaid Wallet, P2P Disbursal & UPI Engine
Router::post('/api/v1/wallet/transfer-p2p', 'WalletController@transferP2P');
Router::post('/api/v1/wallet/topup-upi', 'WalletController@generateUpiQr');
Router::post('/api/v1/wallet/topup-request', 'WalletController@requestUtrTopup');
Router::post('/api/v1/wallet/approve-utr', 'WalletController@approveUtrTopup');

// 5. Cloudflare R2 Document Vault
Router::post('/api/v1/documents/upload', 'DocumentController@uploadDocument');
Router::get('/api/v1/documents', 'DocumentController@listDocuments');

// 6. Government Verification Sandboxes
Router::post('/api/v1/government/verify-pan', 'GovernmentController@verifyPan');
Router::post('/api/v1/government/verify-gstin', 'GovernmentController@verifyGstin');

// 7. Portal Analytics & Live Aggregated Stats
Router::get('/api/v1/dashboard/stats', 'DashboardController@getStats');

// 8. Super Admin Portal & Master Control Center
Router::get('/api/v1/admin/users', 'DashboardController@listAdminUsers');
Router::post('/api/v1/admin/users/create', 'DashboardController@createUser');
Router::post('/api/v1/admin/users/status', 'DashboardController@toggleUserStatus');
Router::get('/api/v1/admin/audit-ledger', 'DashboardController@getAuditLedger');
Router::post('/api/v1/admin/tenant/update', 'DashboardController@updateTenantBranding');
Router::get('/api/v1/wallet/pending-utrs', 'WalletController@getPendingUtrs');

