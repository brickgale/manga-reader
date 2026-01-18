# Manga Reader - Docker Setup

## Overview

This Docker setup separates the frontend and backend services:
- **Frontend**: Built as a Vue.js app (build-only service)
- **Backend**: Express.js server that serves the API and frontend static files

## Architecture

The setup uses Docker Compose with:
1. A frontend build service that compiles the Vue.js app
2. A backend service that runs the Express server and serves both the API and built frontend
3. Shared volumes to pass the frontend build to the backend
4. Persistent storage for the database and images

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- The `images/` folder should be in the project root

### Running the Application

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (clean slate):**
   ```bash
   docker-compose down -v
   ```

### Accessing the Application

- **Application**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## How It Works

### Frontend Build Process
1. The frontend service builds the Vue.js application
2. The compiled static files are placed in a shared volume (`frontend-dist`)
3. The frontend service exits after building (it doesn't stay running)

### Backend Runtime
1. The backend waits for frontend to build
2. It mounts the frontend build volume at `/app/frontend/dist`
3. Runs Prisma migrations to set up the database
4. Starts the Express server which:
   - Serves API routes at `/api/*`
   - Serves frontend static files for all other routes
   - Uses the images from the mounted `./images` directory

### Data Persistence

The setup uses volumes for data persistence:
- `frontend-dist`: Shared volume containing the built frontend
- `backend-data`: Persistent database storage
- `./images`: Bind-mounted manga images folder

## Development

### Rebuilding After Code Changes

**Frontend changes:**
```bash
docker-compose up --build frontend
docker-compose restart backend
```

**Backend changes:**
```bash
docker-compose up --build backend
```

**Both:**
```bash
docker-compose up --build
```

### Database Migrations

Migrations run automatically on startup. To run them manually:
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Viewing the Database

```bash
docker-compose exec backend npx prisma studio
```

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=file:/data/dev.db
```

## Troubleshooting

### Frontend not loading
- Check if the frontend service built successfully: `docker-compose logs frontend`
- Verify the volume is mounted: `docker-compose exec backend ls -la /app/frontend/dist`

### Database issues
- Remove the volume and restart: `docker-compose down -v && docker-compose up --build`

### Port already in use
- Change the port mapping in docker-compose.yml: `"3001:3000"`

### Images not showing
- Ensure the `images/` folder exists in the project root
- Check permissions: `chmod -R 755 images/`

## Production Deployment

For production deployment:

1. **Use environment-specific configuration:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

2. **Use a production database:**
   - Update DATABASE_URL to use PostgreSQL or MySQL
   - Update the Prisma schema provider accordingly

3. **Add reverse proxy (nginx/traefik) for:**
   - SSL/TLS termination
   - Load balancing
   - Better static file serving

## Docker Commands Reference

```bash
# Build without starting
docker-compose build

# Start without rebuilding
docker-compose up

# View running containers
docker-compose ps

# Execute command in backend container
docker-compose exec backend <command>

# View resource usage
docker stats

# Clean up unused Docker resources
docker system prune -a
```
