# InfuseTax Cloud REST API Dockerfile with Composer & Eloquent ORM
FROM php:8.3-cli-alpine

# Install system dependencies & PostgreSQL PHP drivers
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath mbstring gd

# Copy Composer binary from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy backend source (including composer.json & vendor)
COPY . /app

ENV PORT=10000
EXPOSE 10000

# Start lightweight HTTP API server responding to dynamic $PORT
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public public/index.php"]
