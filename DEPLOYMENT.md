# EduPro SMS — Deployment Guide

This guide explains how to deploy the School Management System prototype using Docker Compose. The system consists of 5 containers: PostgreSQL (DB), Redis (Cache), Django (Backend API), Next.js (Frontend), and NGINX (Reverse Proxy).

## Prerequisites

- Docker and Docker Compose installed on the host machine.
- Git (if cloning from a repository).

## 1. Setup Environment Variables

1. Copy `.env.example` to `.env.production`.
   ```bash
   cp .env.example .env.production
   ```
2. **CRITICAL:** Edit `.env.production` and replace all placeholder passwords and secret keys with strong, randomly generated values. Do NOT use the defaults in a public deployment.
   - `POSTGRES_PASSWORD`
   - `REDIS_PASSWORD`
   - `SECRET_KEY`
   - `JWT_SIGNING_KEY`

## 2. Build and Deploy

Run the following command from the project root (where `docker-compose.yml` is located):

```bash
docker-compose --env-file .env.production up -d --build
```

This will:
1. Build the frontend and backend images.
2. Start the database and Redis.
3. Run Django migrations and collect static files automatically.
4. Start the Gunicorn server and Next.js instance.
5. Start NGINX to route traffic.

## 3. Generate Demo Data (For Demos Only)

If you are setting this up for a client presentation, you can populate the database with realistic Ugandan school data (students, teachers, grades, finance, etc.).

Run this command inside the backend container:

```bash
docker-compose exec backend python manage.py generate_demo_data --flush
```

> **Warning:** The `--flush` flag will delete any existing data in the database before generating the demo data.

## 4. Accessing the System

Once NGINX is running, you can access the system at:
- **Frontend / Dashboard:** `http://localhost/` (or your domain)
- **Django Admin Interface:** `http://localhost/admin/`
- **REST API Endpoint:** `http://localhost/api/v1/`

### Demo Login Credentials

If you ran the `generate_demo_data` command, the following accounts are available:

| Role | Email / Username | Password |
|------|-----------------|----------|
| **Admin** | `admin@edupro.ug` | `DemoAdmin@2026` |
| **Teacher** | `teacher@edupro.ug` | `DemoTeacher@2026` |
| **Parent** | `parent@edupro.ug` | `DemoParent@2026` |
| **Student** | `student@edupro.ug` | `DemoStudent@2026` |

## 5. View Logs

To monitor the application logs:
```bash
docker-compose logs -f
```

## Cloud Deployment (Railway / Render / AWS)

To deploy to a managed service like Railway or Render:
1. Connect your GitHub repository.
2. Create separate services for PostgreSQL and Redis.
3. Deploy the backend (`Dockerfile` in `/backend`) and link the DB/Redis URLs in the environment variables.
4. Deploy the frontend (`Dockerfile` in `/frontend`) and set `NEXT_PUBLIC_API_URL` to your live backend domain.
5. The cloud provider's built-in routing will replace the need for the NGINX container.
