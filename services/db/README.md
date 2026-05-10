# Reflections | Projections Database

This service owns the local database bootstrap files and Docker orchestration used for local development and API tests:

- `init-scripts/00-roles.sql`: local roles and role setup
- `init-scripts/01-schema.sql`: schema, enums, tables, indexes, constraints, and functions
- `init-scripts/02-grants.sql`: grants for local Supabase-style roles
- `kong.yml`: local Kong gateway configuration for Supabase-style routes
- `docker-compose.yml`: development database, Kong, PostgREST, Meta, and Studio stack
- `docker-compose.test.yml`: isolated API test database, Kong, and PostgREST stack
- `db-tools.mjs`: portable helper used by this package's `yarn` scripts
- `generate-supabase-test-env.mjs`: creates ephemeral API test JWT material in `services/api/testing/.supabase-test.env`

This package owns DB-only commands and the ephemeral env file required by the isolated API test database. Cross-service workflows, such as starting the isolated DB stack, running Jest, and cleanup, are coordinated by the root package.

For schema changes, update `init-scripts/01-schema.sql` and run the full API verification path from the repo root:

```bash
yarn api:test
```

Validate the development and API test Compose configs from this package:

```bash
cd services/db && yarn verify
```

`yarn verify` reuses the existing API test env file when it is present, so it will not rotate keys underneath a running manual test stack.

Use the DB package directly when you need manual infrastructure control:

```bash
cd services/db && yarn infra:start
cd services/db && yarn infra:start:verbose
cd services/db && yarn infra:start:detached
cd services/db && yarn infra:status
cd services/db && yarn infra:stop
cd services/db && yarn infra:clean
cd services/db && yarn infra:logs
cd services/db && yarn infra:logs:infra
cd services/db && yarn infra:dashboard
cd services/db && yarn infra:db
cd services/db && yarn api:test:env
cd services/db && yarn api:test:db:start
cd services/db && yarn api:test:db:wait
cd services/db && yarn api:test:db:stop
```

`yarn infra:dashboard` prints the Supabase Studio table editor URL for the running development database.
