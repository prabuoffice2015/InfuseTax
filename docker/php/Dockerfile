# InfuseTax PHP 8.3 FPM Dockerfile with PostgreSQL & Redis
FROM php:8.3-fpm-alpine

# Install system dependencies & compilation tools
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    curl \
    git \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    libzip-dev \
    oniguruma-dev \
    linux-headers

# Install PHP extensions for PostgreSQL, BCMath, Zip & GD
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring zip exif pcntl bcmath gd

# Install Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Clean up build tools to keep image small
RUN apk del $PHPIZE_DEPS

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# Permissions
RUN chown -R www-data:www-data /var/www

USER www-data

EXPOSE 9000
CMD ["php-fpm"]
