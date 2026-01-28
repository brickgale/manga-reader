#!/bin/sh
set -e

envsubst '$VHOST_DOMAIN' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'