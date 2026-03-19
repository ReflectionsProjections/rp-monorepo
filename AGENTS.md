# Agent Guide

This repository is the canonical Reflections | Projections monorepo.

## Paths

- Prefer repo-relative paths in commands and explanations.
- Use absolute paths only for tool-required clickable references.

## Default Working Rule

If the task is about product code, work in the owning monorepo area:

- `services/api` for API application code
- `apps/web` for the web workspace root and shared web tooling
- `apps/web/apps/*` for individual web apps
- `apps/mobile` for the mobile app

Do not default to editing the repo root for product behavior changes.

## When To Edit The Repo Root

Only edit the repo root for shared monorepo concerns, such as:

- `README.md`
- `docker-compose.yml`
- `setup.sh`
- `dev-env.code-workspace`
- `.github/workflows/*`
- `scripts/*`
- development database and Supabase stack wiring
- root `.env` usage and shared developer workflow

## Environment Files

- Treat the root `.env` as the shared local environment file.
- Do not add repo automation that copies `.env` into service directories.
- The repo root is the source of truth for local database and Supabase environment wiring.
- If a service needs env access during local Docker development, prefer wiring the root `.env` through Compose or service-local config.

## Development Database

- The repo root owns the development database and Supabase-related Docker stack.
- Treat the root `docker-compose.yml`, `scripts/rp`, and root `.env` as the control plane for local DB/tooling behavior.
- Do not move development database startup instructions into service READMEs or service-local automation.
- API code in `services/api` may depend on the local database, but the database itself is started and managed from the repo root.

## Verification

Prefer the root helper commands when they match the change:

- `./scripts/verify-root.sh`

For service-local checks, run them from the owning directory:

- `cd services/api && yarn verify`
- `cd services/api && yarn test`
- `cd apps/web && yarn verify`
- `cd apps/mobile && yarn lint`
- `cd apps/mobile && yarn verify`

## Running The Stack

Run development database and stack-level commands from the repo root.

- `rp start`
- `rp start-verbose`
- `rp start-detached`
- `rp stop`
- `rp logs`

These commands are the supported way to start and manage the local development database and Supabase-related tooling in Docker. Run the API, web, and mobile apps directly on the host machine from their owning directories.

Expected local URLs:

- API: `http://localhost:3000`
- Site: `http://localhost:3001`
- Admin: `http://localhost:3002`
- Info: `http://localhost:3003`
- Hype: `http://localhost:3004`
- Sponsor: `http://localhost:3005`
- Dashboard: `http://localhost:3006`
- Supabase Studio: `http://localhost:8001`
- Expo Metro: `http://localhost:8081`
- Expo Web: `http://localhost:19006`
