<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Third-Party Services & Integration Configurations
    |--------------------------------------------------------------------------
    */

    'cloudflare_r2' => [
        'account_id' => getenv('CLOUDFLARE_R2_ACCOUNT_ID') ?: '',
        'access_key' => getenv('CLOUDFLARE_R2_ACCESS_KEY_ID') ?: '',
        'secret_key' => getenv('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ?: '',
        'bucket'     => getenv('CLOUDFLARE_R2_BUCKET') ?: 'infusetax-vault',
        'endpoint'   => 'https://' . (getenv('CLOUDFLARE_R2_ACCOUNT_ID') ?: 'account') . '.r2.cloudflarestorage.com',
    ],

    'dlt_sms' => [
        'sender_id' => getenv('DLT_SMS_SENDER_ID') ?: 'INFUST',
        'api_key'   => getenv('DLT_SMS_API_KEY') ?: '',
    ],

    'upi' => [
        'vpa'        => getenv('UPI_PAYEE_VPA') ?: 'infusetax.retail@icici',
        'payee_name' => getenv('UPI_PAYEE_NAME') ?: 'InfuseTax Technologies Pvt Ltd',
        'currency'   => 'INR',
    ],

    'government_sandboxes' => [
        'gstn' => [
            'client_id' => getenv('GOVT_GSTN_CLIENT_ID') ?: '',
            'state_hub' => '33 - Tamil Nadu',
        ],
        'protean_nsdl' => [
            'api_key'  => getenv('GOVT_PROTEAN_API_KEY') ?: '',
            'endpoint' => 'https://api.protean.gov.in/pan/v2/verify',
        ],
    ],
];
