# API for Reflections | Projections

This is the backend API service for Reflections | Projections, built with Node.js, Express, and TypeScript.

Shared setup, environment, and local infrastructure live at the monorepo root. Use the root README for DB/tooling startup, shared URLs, and verification commands outside this service.

## Quick Start

From `services/api`:

1. Install dependencies:

   ```bash
   yarn
   ```

2. Make sure the shared root `.env` is in place.

3. From the repo root, start the local database and Supabase tooling:

   ```bash
   rp start
   ```

4. Run the API:

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

The API's local database is initialized from the repo root `docker/init-scripts/` scripts:

1. `00-roles.sql`
2. `01-schema.sql`
3. `02-grants.sql`

Most schema changes belong in `docker/init-scripts/01-schema.sql`.

## Development Workflow

Keep the root DB/tooling stack running while you work locally:

```bash
rp start
```

Then run the API from `services/api`:

```bash
yarn dev
```

The API connects to the local Supabase services through values in the shared root `.env`.

## Testing

Run tests with the root DB/tooling stack running:

```bash
yarn test
```

## Troubleshooting

1. Port conflicts: make sure ports `3000`, `5432`, `8000`, and `8001` are available.
2. Environment variables: confirm the repo-root `.env` is present and up to date.
3. Database connection: check that the root DB/tooling stack is healthy before starting the API.

Useful repo-root commands:

```bash
rp logs-infra
rp clean
```
