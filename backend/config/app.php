<?php

return [
    'name'     => 'InfuseTax Enterprise API Engine',
    'version'  => '2.0.0',
    'env'      => getenv('APP_ENV') ?: 'production',
    'debug'    => filter_var(getenv('APP_DEBUG') ?: false, FILTER_VALIDATE_BOOLEAN),
    'url'      => getenv('APP_URL') ?: 'http://localhost:8888',
    'timezone' => getenv('APP_TIMEZONE') ?: 'Asia/Kolkata',
];
