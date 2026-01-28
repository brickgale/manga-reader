# Nginx Dynamic Vhost Setup Notes

## Overview
This document describes the custom nginx setup used in this project to enable dynamic vhost configuration using environment variables and Docker Compose.

## Key Features
- **Dynamic vhost domain**: The nginx config uses `${VHOST_DOMAIN}` from the `.env` file, allowing you to change the vhost domain without editing config files.
- **envsubst for templating**: The nginx config is generated at container startup using `envsubst`, which substitutes environment variables in the config template.
- **Custom entrypoint**: A shell script (`nginx-entrypoint.sh`) runs `envsubst` and then starts nginx, ensuring the config is always up-to-date with environment variables.
- **Docker Compose integration**: The `VHOST_DOMAIN` variable is passed to the nginx container via the `environment` section in `docker-compose.yml`.
- **.gitignore for generated config**: The generated config file (`nginx.vhost.conf.generated`) is excluded from version control.

## Implementation Steps
1. **nginx.vhost.conf.template**
   - Uses `${VHOST_DOMAIN}` for the server_name.
   - Uses standard nginx variables (e.g., `$host`, `$remote_addr`).
2. **nginx-entrypoint.sh**
   - Runs: `envsubst '$VHOST_DOMAIN' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf`
   - Starts nginx in the foreground.
3. **docker-compose.yml**
   - Mounts the config template and entrypoint script into the nginx container.
   - Sets the entrypoint to `/nginx-entrypoint.sh`.
   - Passes `VHOST_DOMAIN` from `.env` to the container environment.
4. **.gitignore**
   - Excludes `nginx.vhost.conf.generated` from version control.

## Example .env
```
VHOST_DOMAIN=mangareader.local
```

## Usage
- Change `VHOST_DOMAIN` in `.env` to update the vhost domain.
- Recreate the nginx container to apply changes:
  ```sh
  docker compose up -d --force-recreate nginx
  ```

## Troubleshooting
- If the vhost is not accessible, ensure your `.env` is correct and the nginx container is receiving the variable.
- Devices on your LAN must resolve the vhost domain to your server's IP (edit hosts file or set up local DNS).

---
_Last updated: 2026-01-29_
