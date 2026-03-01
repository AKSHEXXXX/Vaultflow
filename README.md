# VaultFlow

**Multi-tenant document workflow platform** — built for teams that need secure document management with structured review and approval flows, isolated per organisation.

Each tenant gets their own isolated space to upload, manage, and route documents through a full lifecycle: **Draft → Submitted → Approved / Rejected**. Every action is tracked with a full audit trail.

---

## What it does

- 🔐 **Auth** — JWT-based login, token refresh, and Google OAuth2 sign-in
- 🏢 **Multi-tenancy** — Complete data isolation between organisations at the database level
- 📄 **Documents** — Upload files to AWS S3, retrieve via secure pre-signed URLs, scoped to your tenant
- 🔄 **Workflow engine** — Submit documents for review; Managers approve or reject; full history logged per document
- 🚦 **Rate limiting** — Redis-backed sliding window rate limiter protecting all API endpoints
- ⚡ **Caching** — Redis cache on document listings for fast repeated reads
- 🛡️ **Role-based access** — `EMPLOYEE`, `MANAGER`, `ADMIN` roles enforced at the endpoint level

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 25 · Spring Boot 3.5 · Spring Security |
| Database | PostgreSQL 15 (Flyway migrations) |
| Cache / Rate limit | Redis 7 |
| File storage | AWS S3 (LocalStack for local dev) |
| Auth | JWT · Google OAuth2 (Spring Security OAuth2 Client) |
| Docs | SpringDoc / Swagger UI |
| Containerisation | Docker · Docker Compose |
| Reverse proxy | Nginx (rate limiting, gzip, security headers, TLS) |
| CI/CD | GitHub Actions → Docker Hub → EC2 |

---

## Running locally

**Prerequisites:** Docker, Java 25+, Maven 3.9+

```bash
# 1. Start the dev infrastructure (Postgres, Redis, LocalStack S3)
docker compose up -d

# 2. Copy the example env file and fill in your values
cp .env.example .env

# 3. Start the app on the dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The API is available at `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`  
Health check: `http://localhost:8080/actuator/health`

---

## API Overview

| Group | Endpoints |
|---|---|
| Auth | `POST /api/v1/auth/register` · `login` · `refresh` · `logout` |
| Users | `GET /api/v1/users/me` · `PUT /api/v1/users/me` |
| Tenants | `GET /api/v1/tenants/me` · `PUT /api/v1/tenants/me` |
| Documents | `POST /api/v1/documents` · `GET` · `DELETE` · `GET /{id}/download` |
| Workflow | `POST /api/v1/documents/{id}/submit` · `approve` · `reject` · `GET /{id}/history` |

Full schema available via Swagger UI when running locally.

---

## Deployment

Production runs on EC2 behind Nginx using `docker-compose.prod.yml`.  
Every push to `main` triggers the GitHub Actions pipeline:

```
Test → Docker build & push → SSH deploy to EC2
```

See `.env.prod.example` for all required environment variables.

---

## Project Structure

```
src/main/java/com/demoapplication/saas/
├── auth/          # Registration, login, JWT, OAuth2 handlers
├── user/          # User entity, profile management
├── tenant/        # Tenant entity, tenant context holder
├── document/      # Document entity, S3 integration, workflow
├── security/      # JWT filter, user principals, OAuth2 service
├── config/        # Security, CORS, S3, Redis, Swagger config
└── common/        # ApiResponse wrapper, GlobalExceptionHandler
```
