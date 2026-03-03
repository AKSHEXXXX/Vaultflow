<div align="center">

# 🔐 VaultFlow

### Multi-tenant document workflow platform

**Upload · Review · Approve · Archive — all in one secure workspace**

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![AWS S3](https://img.shields.io/badge/AWS-S3-FF9900?style=flat-square&logo=amazons3)](https://aws.amazon.com/s3/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[Live Demo](http://65.1.133.248) · [API Docs](http://65.1.133.248/swagger-ui.html)

</div>

---

## What is VaultFlow?

VaultFlow is a **production-ready, multi-tenant SaaS platform** that gives organisations a structured way to manage documents through a full review lifecycle. Each company (tenant) gets a completely isolated workspace — their users, documents, and audit logs never mix with anyone else's.

The core workflow is simple:

```
Employee uploads a document
        ↓
   DRAFT  →  [Submit]  →  PENDING
                               ↓
                    Manager reviews
                    ↙            ↘
               APPROVED        REJECTED
```

Every transition is timestamped and stored in an immutable audit trail.

---

## ✨ Key Features

| Feature | Detail |
|---|---|
| 🔐 **Authentication** | JWT access + refresh tokens, Google OAuth2 sign-in |
| 🏢 **Multi-tenancy** | Full DB-level isolation — tenants can't see each other's data |
| 📄 **Document management** | Upload any file (PDF, Word, Excel, images) up to 20 MB |
| ☁️ **AWS S3 storage** | Files stored securely in S3; downloads via signed URLs (1-hr expiry) |
| 🔄 **Approval workflow** | DRAFT → PENDING → APPROVED / REJECTED with full history |
| 🛡️ **Role-based access** | `ADMIN` · `MANAGER` · `EMPLOYEE` enforced at every endpoint |
| ⚡ **Redis caching** | Document listings cached per-tenant, evicted on mutations |
| 🚦 **Rate limiting** | Sliding-window limiter (100 req / 60 s per IP) backed by Redis |
| 🔎 **Audit trail** | Immutable log of every workflow action per document |
| 📱 **Responsive UI** | React + Tailwind frontend with drag-and-drop file upload |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** + **Spring Boot 3** | Core application framework |
| **Spring Security** | JWT auth, OAuth2, method-level RBAC |
| **PostgreSQL 15** | Primary database |
| **Flyway** | Database schema versioning & migrations |
| **Redis 7** | Caching (document lists) + rate limiting (sliding window) |
| **AWS SDK v2** | S3 file upload, presigned URL generation |
| **SpringDoc / Swagger UI** | Auto-generated interactive API docs |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + **Vite** | SPA framework & build tool |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Axios** | HTTP client with global auth + error interceptors |
| **React Router v6** | Client-side routing |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** + **Docker Compose** | Container orchestration (dev & prod) |
| **Nginx** | Reverse proxy, gzip compression, security headers, SSL termination |
| **Let's Encrypt** | Automatic TLS certificates via Certbot (auto-renews before expiry) |
| **AWS EC2** | Production hosting |
| **GitHub Actions** | CI/CD pipeline (test → build → push → deploy) |
| **Docker Hub** | Container image registry |
| **LocalStack** | AWS S3 emulation for local development |

---

## 🚀 Running Locally

### Prerequisites
- **Docker** & **Docker Compose** (for infrastructure)
- **Java 21+** and **Maven 3.9+** (for the backend)
- **Node.js 18+** and **npm** (for the frontend)

### 1 — Clone the repo

```bash
git clone https://github.com/AKSHEXXXX/Vaultflow.git
cd Vaultflow
```

### 2 — Start the dev infrastructure

This starts **PostgreSQL**, **Redis**, and **LocalStack** (S3 emulator) in Docker:

```bash
docker compose up -d
```

### 3 — Run the backend

The `dev` profile auto-connects to LocalStack S3 and the local DB — no AWS account needed.

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend is live at `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`  
Health check: `http://localhost:8080/actuator/health`

### 4 — Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend is live at `http://localhost:5173`

---

## 📡 API Overview

| Group | Method | Endpoint | Access |
|---|---|---|---|
| **Auth** | POST | `/api/v1/auth/register` | Public |
| | POST | `/api/v1/auth/login` | Public |
| | POST | `/api/v1/auth/refresh` | Public |
| | POST | `/api/v1/auth/logout` | Authenticated |
| **Users** | GET | `/api/v1/users/me` | Authenticated |
| | GET | `/api/v1/users` | Authenticated |
| | POST | `/api/v1/users/invite` | ADMIN only |
| | PUT | `/api/v1/users/{id}/role` | ADMIN only |
| | DELETE | `/api/v1/users/{id}` | ADMIN only |
| **Tenants** | GET | `/api/v1/tenants/me` | Authenticated |
| | PUT | `/api/v1/tenants/me` | ADMIN only |
| **Documents** | POST | `/api/v1/documents` | EMPLOYEE, ADMIN |
| | GET | `/api/v1/documents` | Authenticated |
| | GET | `/api/v1/documents/{id}` | Authenticated |
| | GET | `/api/v1/documents/{id}/download` | Authenticated |
| | DELETE | `/api/v1/documents/{id}` | ADMIN |
| **Workflow** | POST | `/api/v1/documents/{id}/submit` | EMPLOYEE, ADMIN |
| | POST | `/api/v1/documents/{id}/approve` | MANAGER, ADMIN |
| | POST | `/api/v1/documents/{id}/reject` | MANAGER, ADMIN |
| | GET | `/api/v1/documents/{id}/history` | Authenticated |

Full interactive schema → Swagger UI.

---

## 🏗 Project Structure

```
VaultFlow/
├── backend/                        # Spring Boot application
│   └── src/main/java/com/demoapplication/saas/
│       ├── auth/                   # Register, login, JWT, refresh tokens, OAuth2
│       ├── user/                   # User entity, CRUD, role management
│       ├── tenant/                 # Tenant entity, context holder (multi-tenancy)
│       ├── document/               # Document entity, S3 upload/download/delete
│       ├── workflow/               # Approval workflow engine + audit history
│       ├── ratelimit/              # Redis sliding-window rate limiter
│       ├── security/               # JWT filter, custom principals, OAuth2 handlers
│       ├── config/                 # Security, CORS, S3, Redis, Swagger config
│       └── common/                 # ApiResponse wrapper, GlobalExceptionHandler
│
├── frontend/                       # React + Vite SPA
│   └── src/
│       ├── pages/                  # Dashboard, Documents, Upload, Login, Settings…
│       ├── components/ui/          # Button, Card, Badge, Input, Modal, Skeleton
│       ├── api/                    # Axios instances for each resource
│       ├── context/                # AuthContext, ToastContext
│       └── layouts/                # AppLayout with role-aware sidebar
│
├── nginx/                          # Nginx reverse proxy config
├── scripts/deploy.sh               # EC2 deployment script
├── docker-compose.yml              # Local dev stack (Postgres + Redis + LocalStack)
├── docker-compose.prod.yml         # Production stack (Postgres + Redis + S3)
└── .github/workflows/              # CI/CD pipeline
    ├── deploy.yml                  # Auto-deploy on push to main
    └── fresh-deploy.yml            # Manual clean-start deployment
```

---

## 🚢 Deployment (CI/CD)

Every push to `main` automatically:

1. **Tests** the backend with a real Postgres + Redis service container
2. **Builds** the Spring Boot JAR and packages it into a Docker image
3. **Builds** the React frontend into an Nginx Docker image
4. **Pushes** both images to Docker Hub
5. **SSH deploys** to EC2 — pulls new images, restarts containers, verifies health

The manual `fresh-deploy` workflow does a full clean start — stops all containers, prunes old images, and rebuilds from scratch. Useful after major infrastructure changes.

### 🔒 SSL / TLS

HTTPS is handled automatically by the deploy script:

- On first deploy, **Certbot** stops Nginx, runs a standalone ACME challenge on port 80, and obtains a certificate from **Let's Encrypt**
- The certificate and private key are written to `~/app/nginx/certs/` and mounted into the Nginx container
- On every subsequent deploy the script checks the cert expiry — if it expires within 30 days it auto-renews before restarting Nginx
- All HTTP traffic is redirected to HTTPS by Nginx

```
Push to main
    ↓
GitHub Actions
    ├── mvn test (Postgres + Redis service containers)
    ├── docker build backend  →  Docker Hub
    ├── docker build frontend →  Docker Hub
    └── SSH → EC2
            ├── docker compose pull
            ├── up postgres + redis
            ├── up backend (wait for /actuator/health)
            └── up frontend + nginx
```

---



https://github.com/user-attachments/assets/10acfc47-0c14-402d-b064-44135775d3a3


---



## 👥 Roles

| Role | Permissions |
|---|---|
| `EMPLOYEE` | Upload documents, submit for review, view own documents |
| `MANAGER` | Approve or reject pending documents, view all tenant documents |
| `ADMIN` | Everything above + invite users, change roles, delete users & documents |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
