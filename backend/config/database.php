<?php

return [
    'default' => getenv('DB_CONNECTION') ?: 'pgsql',

    'connections' => [
        'pgsql' => [
            'driver'   => 'pgsql',
            'host'     => getenv('DB_HOST') ?: 'postgres',
            'port'     => getenv('DB_PORT') ?: '5432',
            'database' => getenv('DB_DATABASE') ?: 'infusetax_db',
            'username' => getenv('DB_USERNAME') ?: 'infusetax_user',
            'password' => getenv('DB_PASSWORD') ?: 'infusetax_secure_password',
            'charset'  => 'utf8',
            'options'  => [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT            => 3,
            ],
        ],
    ],

    'redis' => [
        'host' => getenv('REDIS_HOST') ?: 'redis',
        'port' => (int) (getenv('REDIS_PORT') ?: 6379),
    ],
];
