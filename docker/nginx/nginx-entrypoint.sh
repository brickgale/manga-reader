#!/bin/sh
envsubst '$VHOST_DOMAIN $FRONTEND_PORT $BACKEND_PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
set -e

# Select config template based on APP_ENV
if [ "$APP_ENV" = "development" ]; then
	TEMPLATE=/etc/nginx/conf.d/nginx.vhost.dev.conf.template
else
	TEMPLATE=/etc/nginx/conf.d/nginx.vhost.prod.conf.template
fi

envsubst '$VHOST_DOMAIN $FRONTEND_PORT $BACKEND_PORT' < "$TEMPLATE" > /etc/nginx/conf.d/default.conf

# Cleanup: remove all config templates except the generated one
find /etc/nginx/conf.d/ -type f -name '*.template' ! -name 'default.conf' -delete

exec nginx -g 'daemon off;'
