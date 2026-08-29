# ==============================================================================
# InfuseTax Enterprise High-Concurrency Cloud Dockerfile (PHP 8.3 FPM + Nginx + OPcache)
# ==============================================================================
FROM php:8.3-fpm-alpine

# 1. Install System Dependencies, PostgreSQL Drivers, Nginx & Composer
RUN apk add --no-cache \
    nginx \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    oniguruma-dev \
    git \
    curl \
    composer \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath mbstring gd opcache

# 2. Configure High-Performance PHP OPcache & FPM Pool
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.memory_consumption=64'; \
        echo 'opcache.interned_strings_buffer=8'; \
        echo 'opcache.max_accelerated_files=10000'; \
        echo 'opcache.revalidate_freq=0'; \
        echo 'opcache.validate_timestamps=0'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini \
    && { \
        echo '[www]'; \
        echo 'user = www-data'; \
        echo 'group = www-data'; \
        echo 'listen = 127.0.0.1:9000'; \
        echo 'pm = ondemand'; \
        echo 'pm.max_children = 10'; \
        echo 'pm.process_idle_timeout = 10s'; \
        echo 'pm.max_requests = 500'; \
        echo 'clear_env = no'; \
    } > /usr/local/etc/php-fpm.d/zz-docker.conf

WORKDIR /app

# 3. Copy Dependency Definitions & Install Composer Packages
COPY backend/composer.json /app/
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --ignore-platform-reqs

# 4. Copy Application Source Code
COPY backend /app
RUN composer dump-autoload --optimize --no-dev --ignore-platform-reqs \
    && chown -R www-data:www-data /app \
    && chmod -R 755 /app

# 5. Configure Nginx for Dynamic Cloud Port Binding
RUN mkdir -p /run/nginx && { \
        echo 'server {'; \
        echo '    listen __PORT__ default_server;'; \
        echo '    server_name _;'; \
        echo '    root /app/public;'; \
        echo '    index index.php index.html;'; \
        echo '    charset utf-8;'; \
        echo '    gzip on;'; \
        echo '    gzip_types application/json text/plain text/css application/javascript;'; \
        echo '    client_max_body_size 50M;'; \
        echo '    location / {'; \
        echo '        try_files $uri $uri/ /index.php?$query_string;'; \
        echo '    }'; \
        echo '    location ~ \.php$ {'; \
        echo '        include fastcgi_params;'; \
        echo '        fastcgi_pass 127.0.0.1:9000;'; \
        echo '        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;'; \
        echo '        fastcgi_buffer_size 32k;'; \
        echo '        fastcgi_buffers 8 16k;'; \
        echo '        fastcgi_connect_timeout 30s;'; \
        echo '        fastcgi_read_timeout 60s;'; \
        echo '        fastcgi_send_timeout 60s;'; \
        echo '    }'; \
        echo '    location ~ /\.ht { deny all; }'; \
        echo '}'; \
    } > /etc/nginx/http.d/default.conf

ENV PORT=10000
EXPOSE 10000

# 6. Start Multi-Process Nginx + PHP-FPM Engine
CMD ["sh", "-c", "sed -i \"s/__PORT__/${PORT:-10000}/g\" /etc/nginx/http.d/default.conf && php-fpm -D && nginx -g 'daemon off;'"]
