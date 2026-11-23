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

// 2. Authentication, Profile & Password Management
Router::post('/api/v1/auth/login', 'AuthController@login');
Router::get('/api/v1/auth/profile', 'AuthController@profile');
Router::post('/api/v1/auth/profile/update', 'AuthController@updateProfile');
Router::post('/api/v1/auth/password/change', 'AuthController@changePassword');
Router::post('/api/v1/auth/password/forgot', 'AuthController@forgotPassword');
Router::post('/api/v1/auth/password/reset', 'AuthController@resetPassword');
Router::post('/api/v1/auth/pin/change', 'AuthController@changePin');

// 3. The 3 Core Compliance Services (GST Registration, IT Filing, GST Return Filing)
Router::post('/api/v1/tax/gst-registration', 'TaxController@submitGstRegistration');
Router::post('/api/v1/tax/it-filing', 'TaxController@submitItFiling');
Router::post('/api/v1/tax/ai/form16-ocr', 'TaxController@optimizeForm16');
Router::post('/api/v1/tax/gstr-filing', 'TaxController@submitGstrFiling');
Router::get('/api/v1/filings/recent', 'TaxController@getRecentFilings');
Router::get('/api/v1/service-approvals/list', 'TaxController@getServiceApprovalsList');
Router::post('/api/v1/service-approvals/approve', 'TaxController@approveServiceApplication');
Router::post('/api/v1/service-approvals/reject', 'TaxController@rejectServiceApplication');

// 4. Direct Tier Pricing Setup & Audit Trail
Router::get('/api/v1/pricing', 'DashboardController@getPricing');
Router::get('/api/v1/pricing/audit-logs', 'DashboardController@getPricingAuditLogs');
Router::post('/api/v1/pricing/create', 'DashboardController@createPricingService');
Router::post('/api/v1/super-admin/pricing/update', 'DashboardController@updateSuperAdminPricing');
Router::get('/api/v1/distributor/outlets', 'DashboardController@listDistributorOutlets');
Router::get('/api/v1/distributor/outlets/activity', 'DashboardController@getOutletActivity');
Router::post('/api/v1/distributor/pricing/update', 'DashboardController@updateDistributorPricing');

// 5. Unified Wallet Requests & Multi-Tier Approvals
Router::get('/api/v1/wallet/requests', 'DashboardController@getWalletRequests');
Router::post('/api/v1/wallet/requests/create', 'DashboardController@createWalletRequest');
Router::post('/api/v1/wallet/requests/approve', 'DashboardController@approveWalletRequest');
Router::post('/api/v1/wallet/requests/reject', 'DashboardController@rejectWalletRequest');
Router::post('/api/v1/wallet/transfer-p2p', 'WalletController@transferP2P');
Router::post('/api/v1/wallet/topup-upi', 'WalletController@generateUpiQr');
Router::post('/api/v1/wallet/topup-request', 'WalletController@requestUtrTopup');
Router::post('/api/v1/wallet/approve-utr', 'WalletController@approveUtrTopup');
Router::get('/api/v1/wallet/pending-utrs', 'WalletController@getPendingUtrs');

// 6. Cloudflare R2 Document Vault
Router::post('/api/v1/documents/upload', 'DocumentController@uploadDocument');
Router::get('/api/v1/documents', 'DocumentController@listDocuments');

// 7. Government Verification Sandboxes
Router::post('/api/v1/government/verify-pan', 'GovernmentController@verifyPan');
Router::post('/api/v1/government/verify-gstin', 'GovernmentController@verifyGstin');

// 8. Portal Analytics & Live Aggregated Stats
Router::get('/api/v1/dashboard/stats', 'DashboardController@getStats');

// 9. Super Admin, Company & Hierarchical User Suite
Router::get('/api/v1/admin/companies', 'DashboardController@getCompanies');
Router::post('/api/v1/admin/companies/create', 'DashboardController@createCompany');
Router::post('/api/v1/admin/companies/update', 'DashboardController@updateCompany');
Router::post('/api/v1/admin/companies/toggle-status', 'DashboardController@toggleCompanyStatus');
Router::post('/api/v1/admin/companies/logo', 'DashboardController@uploadTenantLogo');

Router::get('/api/v1/admin/users', 'DashboardController@listAdminUsers');
Router::post('/api/v1/admin/users/create', 'DashboardController@createUser');
Router::post('/api/v1/admin/users/update', 'DashboardController@updateUser');
Router::post('/api/v1/admin/users/reset-password', 'DashboardController@resetUserPassword');
Router::post('/api/v1/admin/users/adjust-wallet', 'DashboardController@adjustUserWallet');
Router::post('/api/v1/admin/users/delete', 'DashboardController@deleteUser');
Router::post('/api/v1/admin/users/status', 'DashboardController@toggleUserStatus');

Router::post('/api/v1/distributor/retailers/create', 'DashboardController@createUser');
Router::get('/api/v1/retailer/operators', 'DashboardController@getRetailerOperators');
Router::post('/api/v1/retailer/operators/create', 'DashboardController@createUser');
Router::post('/api/v1/retailer/operators/adjust-float', 'DashboardController@adjustOperatorFloat');

// Retailer Customer & Services endpoints
Router::get('/api/v1/retailer/customers', 'DashboardController@getRetailerOperators');
Router::post('/api/v1/retailer/customers/create', 'DashboardController@createUser');
Router::post('/api/v1/retailer/customers/update', 'DashboardController@updateUser');
Router::post('/api/v1/services/esevai/apply', 'TaxController@submitEsevaiApplication');
Router::get('/api/v1/services/esevai/list', 'TaxController@getEsevaiList');

// Customer Daily Invoices & Monthly GST Return Filing
Router::get('/api/v1/customer/invoices', 'TaxController@getCustomerInvoices');
Router::post('/api/v1/customer/invoices/upload', 'TaxController@uploadCustomerInvoice');
Router::post('/api/v1/customer/invoices/delete', 'TaxController@deleteCustomerInvoice');
Router::post('/api/v1/retailer/gstr/monthly-submit', 'TaxController@submitMonthlyGstFiling');
Router::post('/api/v1/retailer/itr/monthly-submit', 'TaxController@submitMonthlyItFiling');
Router::get('/api/v1/admin/audit-ledger', 'DashboardController@getAuditLedger');
Router::post('/api/v1/admin/tenant/update', 'DashboardController@updateTenantBranding');
Router::post('/api/v1/admin/branding/update', 'DashboardController@updateTenantBranding');
Router::post('/api/v1/admin/permissions/update', 'DashboardController@updateCompanyPermissions');
Router::post('/api/v1/distributor/permissions/update', 'DashboardController@updateUserPermissions');
Router::post('/api/v1/retailer/permissions/update', 'DashboardController@updateUserPermissions');
Router::post('/api/v1/admin/user-permissions/update', 'DashboardController@updateUserPermissions');

// 10. Live Statutory Announcements & Broadcasts
Router::get('/api/v1/announcements', 'DashboardController@getAnnouncements');
Router::post('/api/v1/admin/announcements/create', 'DashboardController@createAnnouncement');
Router::post('/api/v1/admin/announcements/update', 'DashboardController@updateAnnouncement');
Router::post('/api/v1/admin/announcements/delete', 'DashboardController@deleteAnnouncement');
Router::post('/api/v1/admin/announcements/status', 'DashboardController@toggleAnnouncementStatus');

// 11. Live Real-Time Notifications
Router::get('/api/v1/notifications', 'NotificationController@list');
Router::post('/api/v1/notifications/read-all', 'NotificationController@markAllAsRead');



// 10. WhatsApp Multi-Tier Communication & Gateway Configuration
Router::get('/api/v1/whatsapp/config', 'DashboardController@getWhatsAppConfig');
Router::post('/api/v1/admin/whatsapp/config', 'DashboardController@updateAdminWhatsAppConfig');
Router::post('/api/v1/distributor/whatsapp/config', 'DashboardController@updateDistributorWhatsAppConfig');
Router::post('/api/v1/whatsapp/test-message', 'DashboardController@sendTestWhatsAppMessage');

// 12. Company Bank Accounts & Dynamic UPI QR Configurations
Router::get('/api/v1/company/bank-accounts', 'CompanyBankAccountController@listAccounts');
Router::post('/api/v1/super-admin/bank-accounts/create', 'CompanyBankAccountController@createAccount');
Router::post('/api/v1/super-admin/bank-accounts/update', 'CompanyBankAccountController@updateAccount');
Router::post('/api/v1/super-admin/bank-accounts/toggle-status', 'CompanyBankAccountController@toggleStatus');
Router::post('/api/v1/super-admin/bank-accounts/set-primary', 'CompanyBankAccountController@setPrimary');
Router::post('/api/v1/super-admin/bank-accounts/delete', 'CompanyBankAccountController@deleteAccount');
Router::post('/api/v1/super-admin/upi-config/update', 'CompanyBankAccountController@updateUpiConfig');
