# API for Reflections | Projections

This is the backend API service for Reflections | Projections, built with Node.js, Express, and TypeScript.

Shared setup and cross-service workflows live at the monorepo root. Database infrastructure lives in `services/db`. Use the root README for common startup, shared URLs, and verification commands outside this service.

## Quick Start

For the common API-only development flow, run from the repo root:

```bash
yarn dev:api
```

For manual service control from `services/api`:

1. Make sure the shared root `.env` is in place.

2. From the repo root, start the local database and Supabase tooling:

   ```bash
   cd services/db && yarn infra:start
   ```

3. Run the API:

   ```bash
   yarn dev
   ```

## Scripts

| Task | Command |
| --- | --- |
| Start development server | `yarn dev` |
| Start production server | `yarn start` |
| Run tests | `yarn test` |
| Run tests in watch mode | `yarn test:watch` |
| Lint code | `yarn lint` |
| Check lint | `yarn lint:check` |
| Format code | `yarn format` |
| Check formatting | `yarn format:check` |
| Build project | `yarn build` |
| Verify | `yarn verify` |

## Database Management

The API's local database is initialized from the repo root `services/db/init-scripts/` scripts:

1. `00-roles.sql`
2. `01-schema.sql`
3. `02-grants.sql`

Most schema changes belong in `services/db/init-scripts/01-schema.sql`.

## Development Workflow

For the common API-only development flow, run this from the repo root:

```bash
yarn dev:api
```

That starts the DB/tooling stack through `services/db`, then starts the API. For manual control, keep the DB/tooling stack running:

```bash
cd services/db && yarn infra:start
```

Then run the API from `services/api`:

```bash
yarn dev
```

The API connects to the local Supabase services through values in the shared root `.env`.

## Testing

API tests use an isolated Postgres + PostgREST + Kong stack, separate from the development stack. This keeps the same `/rest/v1` Supabase gateway interface as local development while avoiding Studio, Meta, and the development database started with `cd services/db && yarn infra:start`.

From the repo root, run the full API test flow:

```bash
yarn api:test
```

This command owns the isolated Docker stack and tears it down after Jest exits, including when you stop the run with Ctrl+C.

To manage the isolated test stack manually from the repo root:

```bash
cd services/db && yarn api:test:env
cd services/db && yarn api:test:db:start
cd services/db && yarn api:test:db:wait
```

Then run raw Jest from `services/api`:

```bash
yarn test
```

When finished, stop and remove the isolated test stack from the repo root:

```bash
cd services/db && yarn api:test:db:stop
```

`services/api/testing/.supabase-test.env` is generated and gitignored. Do not commit it. CI uses the same root workflow.

Docker must be usable from the current shell as `docker compose` without these scripts adding `sudo`. Docker Desktop usually handles this on macOS and Windows. On Linux, use a Docker-enabled shell such as `sg docker -c 'yarn api:test'` from the repo root or configure your user for non-sudo Docker access.

## Troubleshooting

1. Port conflicts: make sure ports `3000`, `5432`, `8000`, `8001`, and `8100` are available.
2. Environment variables: confirm the repo-root `.env` is present and up to date.
3. Database connection: check that the root DB/tooling stack is healthy before starting the API.
4. Test database connection: confirm the `rp-api-test` stack is running and Kong is available at `http://localhost:8100`.

Useful repo-root commands:

```bash
cd services/db && yarn infra:logs:infra
cd services/db && yarn infra:clean
```
