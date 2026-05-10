# Reflections | Projections Monorepo

This repository is the canonical monorepo for Reflections | Projections development. The API, web, and mobile codebases live together here so features can ship in a single branch and a single pull request.

For local development, Docker is used only for the database and Supabase-related tooling. The API, web, and mobile apps run directly on the host machine.

## Layout

- `services/api`: API service
- `services/db`: local database schema and Supabase gateway config
- `apps/web`: web workspace root
- `apps/web/app/sections/*`: site sections such as home, admin, info, hype, sponsor, and dashboard
- `apps/mobile`: Expo mobile app

## Setup

```bash
git clone <repository-url>
cd <repository-directory>
./setup.sh
```

**Before starting development** reach out to your Dev Chairs for the shared `.env` and place it at the repo root.

Web apps load their local `.env` first, then fall back to the root `.env`. The API and local infrastructure also use the root `.env`.

## Local Infrastructure

`services/db/docker-compose.yml` owns the local database and Supabase-related services used during development:

- `db`
- `kong`
- `rest`
- `meta`
- `studio`

The database is initialized from `services/db/init-scripts/` in this order:

1. `00-roles.sql`
2. `01-schema.sql`
3. `02-grants.sql`

If you need to change the local schema, update `services/db/init-scripts/01-schema.sql`.

API tests do not use this development stack. They use an isolated `rp-api-test` Docker Compose project defined in `services/db/docker-compose.test.yml`; see `services/api/README.md` for the local test workflow.

## Local Development

Run common local workflows from the repo root:

```bash
yarn dev:web
yarn dev:api
yarn dev:api:web
yarn dev:api:mobile
yarn dev:all
```

`yarn dev:web` starts only the web app and points it at the deployed API. The scripts that include `api` start the local database tooling first, then run the selected app processes on your host machine with the web app pointed at the local API when applicable.

See `services/api/README.md`, `services/db/README.md`, `apps/web/README.md`, and `apps/mobile/README.md` for service-specific or manual workflows.

## Common Commands

Run the full API test flow from the repo root:

```bash
yarn api:test
```

Database-only commands live in `services/db`; see `services/db/README.md`.

Docker must be usable from the current shell as `docker compose` without these scripts adding `sudo`. Docker Desktop usually handles this on macOS and Windows. On Linux, add your user to the Docker group, open a Docker-enabled shell, or run a command through that group, for example:

```bash
sg docker -c 'yarn api:test'
```

## Service URLs

| Service | URL |
| --- | --- |
| API | http://localhost:3000 |
| Site | http://localhost:3001 |
| Kong Gateway | http://localhost:8000 |
| Supabase Studio | http://localhost:8001/project/default/editor |
| Expo Metro | http://localhost:8081 |
| Expo Web | http://localhost:19006 |

## Verification

Run the matching checks from the owning directory:

```bash
./scripts/verify-root.sh
cd services/db && yarn verify
cd services/api && yarn verify
cd apps/web && yarn verify
cd apps/mobile && yarn verify
```

Use `yarn api:test` from the repo root to generate ephemeral test keys, start the isolated API test database stack, run API tests, and clean up.

## CI

GitHub Actions live in `.github/workflows/ci.yml`.

- Root changes run the root sanity checks
- `services/db/**` and database stack changes validate the database Compose configs, then run API checks against the isolated Postgres + PostgREST + Kong test stack
- `services/api/**` changes run API build, lint, format, and tests; API-only changes skip the separate DB validation job
- `apps/web/**` changes run web type-check, lint, and format checks
- `apps/mobile/**` changes run the mobile verify checks

The final `ci` job is the branch-protection surface for pull requests.
