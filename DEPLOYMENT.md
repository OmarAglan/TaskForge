# TaskForge Deployment Guide

This document is the source of truth for deploying the current stack:

- Backend: NestJS + PostgreSQL
- Frontend: React + Vite
- Realtime: Socket.io

## 1) Production readiness checklist

- [x] Backend production build works (`backend`: `npm run build`)
- [x] Frontend production build works (`frontend`: `npm run build`)
- [x] Dockerfiles added for backend and frontend
- [x] Production compose file added (`docker-compose.prod.yml`)
- [x] Production env template added (`.env.production.example`)
- [ ] TypeORM migrations not set up yet (currently no migration files)
- [ ] Automated tests are not yet implemented

## 2) Deploy with Docker Compose (recommended)

### Step 1: Prepare secrets and env

From project root:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and set real values, especially:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `VITE_API_URL`
- `VITE_WS_URL`

### Step 2: Build and start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

### Step 3: Verify

- Frontend: `http://<server-ip>/`
- Backend health: `http://<server-ip>:3000/api/v1/health`

### Step 4: Update containers after changes

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

### Step 5: Stop

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## 3) Notes for real production environments

- Use HTTPS + domain (Nginx, Caddy, or cloud load balancer).
- Use managed PostgreSQL when possible.
- Rotate JWT secrets and DB password regularly.
- Add CI/CD to build and deploy automatically.
- Add migrations before go-live to avoid schema drift.
