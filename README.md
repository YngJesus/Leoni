# Leoni — Système de Retouche

![NestJS](https://img.shields.io/badge/backend-NestJS-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/deploy-Docker%20Compose-2496ED?logo=docker&logoColor=white)

A full-stack quality/rework tracking application built for Leoni's production line: production teams log defective parts, quality (QM) and process engineering (PE) teams triage and validate the corrective actions, and everything is tracked end to end with role-based access.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Quick start (Docker)](#quick-start-docker)
- [Manual setup (without Docker)](#manual-setup-without-docker)
- [Environment variables](#environment-variables)
- [Roles & workflow](#roles--workflow)
- [API documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## Overview

- **Backend:** NestJS + TypeORM + PostgreSQL, JWT authentication, Swagger docs
- **Frontend:** React + Vite
- **Deployment:** fully containerized with Docker Compose (Postgres, pgAdmin, backend, frontend)

The app digitizes the paper-based rework/repair process on the production floor: defect entry, triage plans, Annexe 3 corrective actions, defect code lookup, and notifications between roles.

## Features

- 🔐 **Authentication** — JWT-based login, role-based route guards
- 🧑‍🤝‍🧑 **User & role management** — Admin, Production, PE (Process Engineering), QM (Quality Management)
- 🏭 **Sites & OEMs** — admin-managed list of production sites and client OEMs
- 🛠️ **Reparation cards** — log unit/série/montage rework cards and track their status (`LOGGED` → `IN_PROGRESS` → `COMPLETED` / `REJECTED`)
- 📋 **Triage plans** — multi-step decision flow (Production → PE → QM) ending in **Réparer/Retoucher** or **Rebuter (Scrap)**, with statuses from `DRAFT` to `VALIDATED`
- 📄 **Annexe 3** — corrective and risk actions with an approval workflow
- 🔎 **Defect codes** — searchable defect code catalog (PI-3039 based)
- 🔔 **Notifications** — in-app notifications and approve/respond actions between roles
- 🖨️ **Printable reports** — generate printable Annexe 3, repair, triage, and theme sheets

## Tech stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Frontend   | React 19, Vite, Tailwind CSS, React Leaflet               |
| Backend    | NestJS 11, TypeORM, PostgreSQL, JWT (Passport), Swagger   |
| Database   | PostgreSQL 16                                             |
| Admin UI   | pgAdmin 4                                                 |
| Deployment | Docker, Docker Compose, Nginx (serves the frontend build) |

## Project structure

```
Leoni final/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── admin/           # sites & OEMs
│   │   ├── auth/            # login, guards, JWT strategy
│   │   ├── users/           # user CRUD, roles
│   │   ├── reparation/      # reparation cards
│   │   ├── triage-plan/     # triage plan workflow
│   │   ├── annexe3/         # corrective/risk actions
│   │   ├── defect-codes/    # defect code catalog
│   │   └── notifications/   # cross-role notifications
│   └── Dockerfile
├── frontend/                 # React + Vite SPA
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml         # postgres + pgadmin + backend + frontend
└── .env.example
```

## Quick start (Docker)

No need to install Node, PostgreSQL, or pgAdmin locally — everything runs in containers.

**Requirements:** Docker Desktop (or Docker Engine + Compose).

```bash
git clone <your-repo-url>
cd "Leoni final"
cp .env.example .env
docker compose up --build
```

Once it's up:

| Service           | URL                        |
| ----------------- | -------------------------- |
| Frontend          | http://localhost:5173      |
| Backend / Swagger | http://localhost:3000/docs |
| pgAdmin           | http://localhost:5050      |

pgAdmin login uses `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` from `.env`. To register the database inside pgAdmin, add a server with:

- Host: `postgres` (the Docker Compose service name — not `localhost`)
- Port: `5432`
- Username/Password: `DB_USERNAME` / `DB_PASSWORD` from `.env`

**Stopping:**

```bash
docker compose down        # stop, keep data
docker compose down -v     # stop and wipe the database volume
```

> The frontend's `VITE_API_URL` is baked into the JS bundle at build time. If you change it in `.env`, rebuild with `docker compose build frontend`.

## Manual setup (without Docker)

<details>
<summary>Expand if you'd rather run things natively</summary>

**Requirements:** Node.js 20+, npm, PostgreSQL, pgAdmin (optional).

```bash
# Backend
cd backend
cp .env.example .env   # adjust DB credentials
npm install
npm run start:dev

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:3000`, frontend on `http://localhost:5173`.

</details>

## Environment variables

Set in `.env` at the project root (used by `docker-compose.yml`):

| Variable           | Description                                | Default                     |
| ------------------ | ------------------------------------------ | --------------------------- |
| `DB_USERNAME`      | Postgres user                              | `postgres`                  |
| `DB_PASSWORD`      | Postgres password                          | `postgres`                  |
| `DB_NAME`          | Database name                              | `leoni`                     |
| `DB_PORT`          | Host port mapped to Postgres               | `5433`                      |
| `JWT_SECRET`       | Secret used to sign JWTs                   | `change-this-local-secret`  |
| `VITE_API_URL`     | API base URL baked into the frontend build | `http://localhost:3000/api` |
| `PGADMIN_EMAIL`    | pgAdmin login email                        | `admin@leoni.dev`           |
| `PGADMIN_PASSWORD` | pgAdmin login password                     | `admin123`                  |
| `PGADMIN_PORT`     | Host port for pgAdmin                      | `5050`                      |

⚠️ Change `JWT_SECRET` and the Postgres/pgAdmin credentials before any real deployment. `.env` is gitignored — never commit real secrets.

## Roles & workflow

| Role                         | Responsibilities                                               |
| ---------------------------- | -------------------------------------------------------------- |
| **ADMIN**                    | Manage users, sites, OEMs                                      |
| **PRODUCTION**               | Log defects/reparation cards, start triage plans               |
| **PE** (Process Engineering) | Review triage plans, decide repair/scrap actions               |
| **QM** (Quality Management)  | Final validation/approval of triage plans and Annexe 3 actions |

Typical triage plan flow:

```
DRAFT → PENDING_QM → (IN_RETOUCH | SCRAPPED) → VALIDATED
```

## API documentation

Interactive Swagger docs are available once the backend is running:

```
http://localhost:3000/docs
```

All endpoints are prefixed with `/api` and protected routes require a Bearer JWT obtained from `POST /api/auth/login`.

## Troubleshooting

- **Frontend can't reach the API** — check the backend is running on port `3000` and `VITE_API_URL` is correct (rebuild the frontend image if you changed it).
- **Port already in use** — change the conflicting port in `.env` (`DB_PORT`, `PGADMIN_PORT`, or the `ports:` mapping in `docker-compose.yml`).
- **Database not initialized** — TypeORM runs with `synchronize: true`, so tables are created automatically on backend startup; just make sure the `postgres` container is healthy before the backend starts (Docker Compose already waits for this).
