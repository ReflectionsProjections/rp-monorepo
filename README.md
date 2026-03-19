# Reflections | Projections Monorepo

This repository is the canonical monorepo for Reflections | Projections development. The API, web, and mobile codebases live together here so features can ship in a single branch and a single pull request.

For local development, Docker is used only for the database and Supabase-related tooling. The API, web, and mobile apps run directly on the host machine.

## Layout

- `services/api`: API service
- `apps/web`: web workspace root
- `apps/web/apps/*`: site, admin, info, hype, sponsor, and dashboard apps
- `apps/mobile`: Expo mobile app
- `docker/init-scripts`: local database bootstrap scripts
- `scripts/rp`: root helper for local orchestration

## Setup

```bash
git clone <repository-url>
cd dev-env
./setup.sh
```

Before starting services:

- Reach out to your Dev Chairs for the shared `.env`
- Place it at the repo root as `.env`
- Install dependencies in `services/api`, `apps/web`, and `apps/mobile` with `yarn`

Web apps load their local `.env` first, then fall back to the root `.env`. The API and local infrastructure also use the root `.env`.

## Local Infrastructure

The root `docker-compose.yml` owns the local database and Supabase-related services used during development:

- `db`
- `kong`
- `rest`
- `meta`
- `studio`

The database is initialized from `docker/init-scripts/` in this order:

1. `00-roles.sql`
2. `01-schema.sql`
3. `02-grants.sql`

If you need to change the local schema, update `docker/init-scripts/01-schema.sql`.

## Local Development

1. Start the local database and Supabase tooling:

```bash
rp start
```

2. In separate terminals, run app processes on your host machine:

```bash
cd services/api && yarn dev
cd apps/web && yarn workspace @rp/site dev
cd apps/mobile && yarn start
```

Swap `@rp/site` for any other web app workspace such as `@rp/admin`, `@rp/info`, `@rp/hype`, `@rp/sponsor`, or `@rp/dashboard`.

See `services/api/README.md`, `apps/web/README.md`, and `apps/mobile/README.md` for service-specific workflows.

## Common Commands

```bash
rp start
rp start-verbose
rp start-detached
rp status
rp stop
rp clean
rp logs
rp logs-infra
rp db
```

## Service URLs

| Service | URL |
| --- | --- |
| API | http://localhost:3000 |
| Site | http://localhost:3001 |
| Admin | http://localhost:3002 |
| Info | http://localhost:3003 |
| Hype | http://localhost:3004 |
| Sponsor | http://localhost:3005 |
| Dashboard | http://localhost:3006 |
| Kong Gateway | http://localhost:8000 |
| Supabase Studio | http://localhost:8001 |
| Expo Metro | http://localhost:8081 |
| Expo Web | http://localhost:19006 |

## Verification

Run the matching checks from the owning directory:

```bash
./scripts/verify-root.sh
cd services/api && yarn verify
cd apps/web && yarn verify
cd apps/mobile && yarn verify
```

## CI

GitHub Actions live in `.github/workflows/ci.yml`.

- Root changes run the root sanity checks
- `services/api/**` changes run API build, lint, format, and tests against the root DB/tooling stack
- `apps/web/**` changes run the web verify and format checks
- `apps/mobile/**` changes run the mobile verify checks

The final `ci` job is the branch-protection surface for pull requests.
