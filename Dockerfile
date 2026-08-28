# InfuseTax Cloud REST API Dockerfile for Render Cloud Deployments
FROM php:8.3-cli-alpine

# Install system dependencies, PostgreSQL PHP drivers & Composer
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    oniguruma-dev \
    git \
    curl \
    composer \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath mbstring gd

WORKDIR /app

# Copy dependency definitions from backend directory
COPY backend/composer.json /app/

# Install PHP dependencies with Eloquent ORM
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --ignore-platform-reqs

# Copy backend source code into /app
COPY backend /app

# Generate optimized production autoloader
RUN composer dump-autoload --optimize --no-dev --ignore-platform-reqs

ENV PORT=10000
EXPOSE 10000

# Start lightweight HTTP API server responding to dynamic $PORT
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public public/index.php"]
