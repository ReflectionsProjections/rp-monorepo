# Agent Guide

This repository is the canonical Reflections | Projections monorepo. Product code for the API, database, web site, and mobile app lives here, while the repo root owns shared setup and cross-service tooling.

## Repo Layout

- `services/api`: API service code
- `services/db`: local database schema, grants, roles, and Kong config used by Docker
- `apps/web`: web workspace for the unified Vite site
- `apps/mobile`: Expo mobile app
- `scripts`: root helper scripts for verification and cross-service orchestration
- `.github/workflows`: CI and automation

## Default Working Rule

When a task is about product behavior, work in the owning area:

- `services/api` for backend/API behavior
- `services/db` for local database schema, roles, grants, and Kong config
- `apps/web` for all website behavior and web tooling
- `apps/mobile` for mobile app behavior

Do not default to editing the repo root for product changes.

## When To Edit The Repo Root

Edit the repo root only for monorepo-wide concerns, such as:

- `README.md`
- `.github/workflows/*`
- `scripts/*`
- `setup.sh`
- shared developer environment docs
- root `.env` usage
- cross-service orchestration and CI wiring

## Environment And Infrastructure

- Treat the root `.env` as the shared local environment file.
- Do not add automation that copies the root `.env` into service directories.
- `services/db/docker-compose.yml`, `services/db/*`, and DB package scripts are the control plane for the local database and Supabase-related services.
- Root package scripts are only for workflows that span packages, such as starting DB infrastructure before API/web/mobile apps or running API tests with the DB test stack.
- API, web, and mobile apps run directly on the host machine from their own directories.
- Docker commands assume `docker compose` works from the current shell without adding `sudo`. On Linux, use a Docker-enabled shell such as `sg docker -c 'yarn api:test'` for root workflows, or configure non-sudo Docker access.

## Running The Stack

Prefer root scripts for common multi-process workflows:

- `yarn dev:api`
- `yarn dev:web`
- `yarn dev:api:web`
- `yarn dev:api:mobile`
- `yarn dev:all`

`yarn dev:web` intentionally runs the web app against the deployed API. Web workflows that include the local API, such as `yarn dev:api:web` and `yarn dev:all`, inject local web API URLs.

Use service-local commands when you need manual control:

- `cd services/db && yarn infra:start`
- `cd services/api && yarn dev`
- `cd apps/web && yarn dev`
- `cd apps/mobile && yarn start`

## Verification

Prefer the narrowest matching verification for the area you changed.

Root-level checks:

- `./scripts/verify-root.sh`
- `yarn api:test` for the full API test flow with an isolated database stack

Service-level checks:

- `cd services/db && yarn verify`
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
- Supabase Studio: `http://localhost:8001/project/default/editor`
- Expo Metro: `http://localhost:8081`
- Expo Web: `http://localhost:19006`

## Guidance For Agents

- Prefer repo-relative paths in commands and explanations.
- Use absolute paths only when a tool requires them, such as clickable file links.
- Check for deeper `AGENTS.md` files before editing inside a subproject.
- Use `services/api/AGENTS.md` for backend and API authoring guidance.
- Use `services/db/AGENTS.md` for local database schema and gateway guidance.
- Use `apps/web/AGENTS.md` for web workspace guidance.
- Keep service-specific guidance in the owning directory rather than expanding the root guide with implementation details.
