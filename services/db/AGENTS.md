# Database Service Guide

This directory owns the local database bootstrap and Supabase gateway configuration used by Docker-based development and API tests.

## Scope

Work here for:

- local Postgres roles, schema, grants, indexes, constraints, and functions
- Kong gateway routes and plugins for Supabase-style local access
- database bootstrap files mounted by `docker-compose.yml`
- database bootstrap files mounted by `docker-compose.test.yml`
- DB package scripts in `package.json` and `db-tools.mjs`
- ephemeral API test DB env generation in `generate-supabase-test-env.mjs`

Do not put API route logic or application data-access helpers here; those belong in `services/api`.

## Files

- `init-scripts/00-roles.sql`: local roles and role setup
- `init-scripts/01-schema.sql`: schema, enums, tables, indexes, constraints, and functions
- `init-scripts/02-grants.sql`: grants for local Supabase-style roles
- `kong.yml`: local Kong gateway configuration
- `pg_config`: local Postgres config files
- `docker-compose.yml`: development database, Kong, PostgREST, Meta, and Studio stack
- `docker-compose.test.yml`: isolated API test database, Kong, and PostgREST stack
- `db-tools.mjs`: portable helper used by this package's `yarn` scripts
- `generate-supabase-test-env.mjs`: creates `services/api/testing/.supabase-test.env` for the isolated API test stack

Root package scripts may call this package when a workflow spans packages. Keep DB-only commands here; do not expose raw infrastructure lifecycle commands from the root package.

Use `cd services/db && yarn infra:dashboard` to print the Supabase Studio table editor URL for the running development database.

## Verification

From the repo root, prefer:

- `cd services/db && yarn verify` for development and API test Compose config validation
- `yarn api:test` for schema/API integration

`yarn verify` reuses `services/api/testing/.supabase-test.env` when present and generates it only when missing, so it does not rotate credentials underneath a running API test stack. Generate it manually with `cd services/db && yarn api:test:env` only when you are managing the API test stack by hand.
