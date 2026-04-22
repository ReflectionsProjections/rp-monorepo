# Agent Guide

This repository is the canonical Reflections | Projections monorepo. Product code for the API, web site, and mobile app lives here, while the repo root owns shared development tooling and local infrastructure.

## Repo Layout

- `services/api`: API service code
- `apps/web`: web workspace for the unified Vite site
- `apps/mobile`: Expo mobile app
- `db`: local database bootstrap files and Kong config used by Docker
- `scripts`: root helper scripts for verification and local orchestration
- `.github/workflows`: CI and automation

## Default Working Rule

When a task is about product behavior, work in the owning area:

- `services/api` for backend/API behavior
- `apps/web` for all website behavior and web tooling
- `apps/mobile` for mobile app behavior

Do not default to editing the repo root for product changes.

## When To Edit The Repo Root

Edit the repo root only for monorepo-wide concerns, such as:

- `README.md`
- `docker-compose.yml`
- `.github/workflows/*`
- `scripts/*`
- `setup.sh`
- shared developer environment docs
- root `.env` usage
- local database and Supabase stack wiring

## Environment And Infrastructure

- Treat the root `.env` as the shared local environment file.
- Do not add automation that copies the root `.env` into service directories.
- The root `docker-compose.yml`, `db/*`, and `scripts/rp` are the control plane for the local database and Supabase-related services.
- API, web, and mobile apps run directly on the host machine from their own directories.

## Running The Stack

Run local infrastructure from the repo root:

- `rp start`
- `rp start-verbose`
- `rp start-detached`
- `rp stop`
- `rp logs`

Then run product apps from their owning directories:

- `cd services/api && yarn dev`
- `cd apps/web && yarn dev`
- `cd apps/mobile && yarn start`

## Verification

Prefer the narrowest matching verification for the area you changed.

Root-level checks:

- `./scripts/verify-root.sh`

Service-level checks:

- `cd services/api && yarn verify`
- `cd services/api && yarn test`
- `cd apps/web && yarn verify`
- `cd apps/web && yarn lint`
- `cd apps/web && yarn type-check`
- `cd apps/web && yarn build`
- `cd apps/mobile && yarn verify`
- `cd apps/mobile && yarn lint`

## Local URLs

Expected local URLs today:

- API: `http://localhost:3000`
- Web site: `http://localhost:3001`
- Kong Gateway: `http://localhost:8000`
- Supabase Studio: `http://localhost:8001`
- Expo Metro: `http://localhost:8081`
- Expo Web: `http://localhost:19006`

## Guidance For Agents

- Prefer repo-relative paths in commands and explanations.
- Use absolute paths only when a tool requires them, such as clickable file links.
- Check for deeper `AGENTS.md` files before editing inside a subproject.
- Use `services/api/AGENTS.md` for backend and API authoring guidance.
- Use `apps/web/AGENTS.md` for web workspace guidance.
- Keep service-specific guidance in the owning directory rather than expanding the root guide with implementation details.
