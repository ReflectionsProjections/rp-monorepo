# API Workspace Guide

This directory contains the Reflections | Projections backend API. Treat it as the owner of HTTP routes, request and response validation, auth rules, and data access behavior for the service.

## Scope

Work here for:

-   Express app wiring and middleware
-   route handlers and websocket behavior
-   API request and response schemas
-   Supabase and database access used by the API
-   API-only utilities, scripts, and tests

Do not edit the repo root from here unless the task is actually about shared infrastructure, CI, Docker, or root environment wiring.

## Source Layout

The current API workspace is organized around feature areas:

-   `src/app.ts`: Express app setup, shared middleware, route mounting, and websocket server setup
-   `src/services/<feature>`: feature-owned routers, schemas, validators, and utilities
-   `src/middleware`: reusable middleware such as auth, error handling, and request guards
-   `src/database.ts`: Supabase client and table accessors
-   `src/config.ts`: environment parsing and runtime config
-   `testing`: Jest setup and shared test helpers

Keep new code in the owning feature area. Do not create a parallel architecture unless the task explicitly requires a broader refactor.

## Environment And Data Rules

-   Treat the repo root `.env` as the source of local environment values for this service.
-   Do not create or sync a service-local `.env` file unless the task explicitly asks for it.
-   Do not invent new environment variable names if an existing config field or pattern already covers the need.
-   Assume normal local development database and Supabase tooling are started by root dev scripts or `services/db` package scripts, not from `services/api`.
-   API Jest tests use a separate isolated Postgres + PostgREST + Kong stack from `services/db/docker-compose.test.yml`, not the development stack.
-   Prefer the root cross-service script for the full API test flow: `yarn api:test` generates test env, starts the isolated database stack through `services/db`, runs Jest, and tears the stack down on normal exits, failures, and Ctrl+C.
-   Use DB package scripts only for manual test database control: `cd services/db && yarn api:test:env`, `cd services/db && yarn api:test:db:start`, `cd services/db && yarn api:test:db:wait`, and `cd services/db && yarn api:test:db:stop`.
-   Do not commit `testing/.supabase-test.env`; it contains generated local test JWT material and is gitignored.
-   Docker must be usable as `docker compose` from the current shell without these scripts adding `sudo`; on Linux, use a Docker-enabled shell such as `sg docker -c 'yarn api:test'` from the repo root or configure non-sudo Docker access.

## Route And Feature Conventions

-   Add new endpoints to the owning feature router under `src/services/<feature>`.
-   Mount new routers from `src/app.ts` only after the feature router exists and the route prefix is clear.
-   Keep route validation close to the route by using the owning feature's schema or validator files.
-   Prefer existing response shapes and error patterns over inventing new ones for a single route.
-   Reuse shared middleware such as `RoleChecker` when auth behavior matches an existing pattern.
-   Prefer extending existing feature files over creating new cross-cutting helpers too early.

## Comments And Documentation

-   Add comments for non-obvious logic, invariants, edge cases, or tricky data flow.
-   Do not add comments that only restate obvious code.
-   When changing exported utilities or helpers with behavior that is hard to infer, update their nearby documentation comments as needed.
-   When adding or changing API routes, add or update Swagger-style `@swagger` blocks near the route handlers. Check the `src/services/events` router for example swagger docs.
-   Keep Swagger docs in sync with the code for:
    -   route path and method
    -   required roles or auth behavior
    -   request params, query, and body
    -   response status codes and payload shapes
-   When behavior changes, update any nearby README or feature-level docs that would otherwise become stale.

## Dependencies

-   Prefer existing packages and in-repo utilities before adding a new dependency.
-   Add a new dependency only when it meaningfully simplifies the code or solves a problem the current stack does not already cover.
-   Avoid overlapping libraries that solve the same problem in different ways.
-   If you add a dependency, update the lockfile and any affected setup or usage docs in the same change.

## Commands

Run commands from `services/api`:

-   `yarn dev`
-   `yarn build`
-   `yarn test`
-   `yarn test:watch`
-   `yarn lint`
-   `yarn lint:check`
-   `yarn format:check`
-   `yarn verify`

API test database setup, from the repo root:

-   `yarn api:test`

Manual API test database setup, from the repo root:

-   `cd services/db && yarn api:test:env`
-   `cd services/db && yarn api:test:db:start`
-   `cd services/db && yarn api:test:db:wait`
-   `cd services/db && yarn api:test:db:stop`

## Verification Expectations

Prefer the narrowest verification that proves the change:

-   route or schema changes: run `yarn api:test` from the repo root, or start the isolated API test DB stack and run `yarn test` from `services/api`
-   type-level or build-sensitive changes: `yarn build`
-   style or rule compliance: `yarn lint:check` and `yarn format:check`
-   broader API changes: `yarn verify`

If tests or verification cannot be run, say so clearly and explain why.

## Definition Of Done

Before considering an API task complete, make sure:

-   changes stay scoped to the owning feature unless a wider edit is actually required
-   request and response validation matches the implemented behavior
-   auth and role requirements are enforced in code and reflected in docs
-   tests are added or updated when behavior changes, or the reason for skipping tests is stated clearly
-   Swagger blocks and nearby docs are updated for changed endpoints
-   non-obvious logic has a short explanatory comment where needed
-   the relevant API verification commands have been run, or any gaps are called out explicitly
