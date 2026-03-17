# Agent Guide

This repository is primarily a development wrapper around the actual service repos in `dev/`.

## Default Working Rule

If the task is about product code, features, bugs, tests, styling, API behavior, database logic, app screens, or service-specific tooling:

- Work in `dev/rp-api` for API and infrastructure code owned by the API repo.
- Work in `dev/rp-web` for website or monorepo frontend code.
- Work in `dev/rp-mobile` for mobile app code.

Do not default to editing files in the `dev-env` root for normal service development.

## When To Edit `dev-env`

Only modify files in the `dev-env` root when the task is specifically about development infrastructure or repository orchestration, such as:

- `setup.sh`
- `docker-compose.yml`
- `README.md`
- `fast-forward.sh`
- `dev-env.code-workspace`
- root `.env` syncing behavior
- Docker container wiring between repos
- the custom `rp` helper command
- cloning/bootstrap behavior for repos under `dev/`

If a user asks to change app behavior and you find yourself editing `dev-env` root files, pause and confirm that the task is actually infra-related.

## Repo Boundaries

- `dev-env` root is not the source of truth for API, web, or mobile product code.
- Each repo under `dev/` should own its own runtime code, package dependencies, Dockerfile, and service-specific scripts whenever practical.
- Prefer changes inside the service repo over adding wrapper logic in `dev-env`.

## Practical Examples

Use `dev-env` root:

- "Add a new `rp` command"
- "Wire mobile into docker compose"
- "Update setup so it clones another repo"
- "Change how local env files are copied"

Use a service repo under `dev/`:

- "Fix the login bug in mobile"
- "Add an endpoint to the API"
- "Update the dashboard UI"
- "Upgrade Expo / React Native"
- "Adjust a Dockerfile for a specific service"

## Verification

When you do change `dev-env` root files, verify at the infra level:

- shell scripts: `bash -n`
- compose changes: `docker compose config`
- helper command changes: rerun `bash setup.sh` if needed

When you change a repo in `dev/`, run verification from that repo unless the task explicitly spans the wrapper environment.

## Environment Files

- Treat the `dev-env` root `.env` as the source of truth for wrapper-managed environment variables.
- Do not make durable env changes by editing `dev/rp-api/.env`, `dev/rp-web/.env`, or `dev/rp-mobile/.env` directly when working through `dev-env`.
- The `rp` helper copies the root `.env` into available service repos before `rp start*` commands and during `rp update`, so direct edits inside `dev/` will be overwritten.
- If the requested change is meant to persist for the wrapper workflow, update the root `.env`, then run `rp update` or restart through an `rp start*` command.
- Only edit a service-local `.env` directly if the user explicitly wants a temporary repo-local override outside the normal `dev-env` sync flow, and call out that it is not durable.

## Testing Services

Prefer Docker-backed verification when it is available and relevant. Use service-local Node or Expo scripts mainly when:

- there is no Docker-backed test path for the check you need
- you need a faster inner-loop check while iterating
- the user explicitly wants host-local verification

## Docker Permissions

If a Docker-backed command fails with a permission error on `/var/run/docker.sock`, do not assume the repo is broken.

Check:

- `id`
- `getent group docker`
- `ls -l /var/run/docker.sock`

Common cause:

- the user is in the `docker` group on the host, but the current shell session has not picked up that group membership yet

Preferred workaround for the current session:

- run Docker commands through `sg docker -c '...'`

Examples:

- `sg docker -c 'docker info'`
- `sg docker -c 'cd dev/rp-api && yarn test:docker'`

If needed, tell the user that a fresh login shell or `newgrp docker` may also resolve the issue outside the current session.

## Running The Stack Cleanly

When a user asks to run services in this repo, prefer the `dev-env` root and the wrapper-level Docker flow first.

- Run from the repo root.
- Prefer `sg docker -c 'docker compose ...'` for Docker commands in this environment.
- For a normal full-stack start, use `sg docker -c 'docker compose up --build -d'`.
- If the user specifically wants the wrapper command, `rp start`, `rp start-verbose`, and `rp start-detached` are the intended entrypoints.
- If Compose fails with container-name conflicts such as `rp-kong`, inspect `sg docker -c 'docker ps -a'` for stale `rp-*` containers from another Compose project before assuming the stack is broken.
- If stale `rp-*` containers are blocking startup and are only in `Created` or otherwise unused states, remove the specific stale containers and retry the start.
- To stop the wrapper stack cleanly, use `sg docker -c 'docker compose down'`.
- To check whether the stack is healthy after startup, use `sg docker -c 'docker compose ps'`.

## Service URLs

When the full web stack is running, the expected host URLs are:

- API: `http://localhost:3000`
- Site: `http://localhost:3001`
- Admin: `http://localhost:3002`
- Info: `http://localhost:3003`
- Hype: `http://localhost:3004`
- Sponsor: `http://localhost:3005`
- Dashboard: `http://localhost:3006`
- Supabase Studio: `http://localhost:8000`
- Expo Metro: `http://localhost:8081`
- Expo Web: `http://localhost:19006`

For admin-site debugging specifically, send the user to `http://localhost:3002`.

## Logs

When a user asks how to see logs, prefer these commands from the repo root:

- All services: `sg docker -c 'docker compose logs -f'`
- API only: `sg docker -c 'docker compose logs -f api'`
- Web only: `sg docker -c 'docker compose logs -f web'`
- Mobile only: `sg docker -c 'docker compose logs -f mobile'`
- Infra only: `sg docker -c 'docker compose logs -f db studio kong rest meta'`

If the user prefers the wrapper helper, the equivalents are:

- `rp logs`
- `rp logs-api`
- `rp logs-web`
- `rp logs-mobile`
- `rp logs-infra`

### API

For API work, prefer container-backed checks first:

- `cd dev/rp-api && yarn test:docker` for the API test container flow
- `rp start-api` when you need to validate behavior against the running API plus infrastructure
- `rp logs-api` to inspect API container logs after a failing runtime check
- `rp enter` or `rp enter-api` to debug inside the API container

Concrete API examples:

- If you changed an endpoint handler or service logic, run `cd dev/rp-api && yarn test:docker`
- If you changed env wiring, Docker behavior, or Supabase/infrastructure interactions, run `rp start-api` and verify the affected flow against the running stack
- If a test passes locally but the containerized API seems broken, run `rp logs-api`
- If you need to inspect files, installed dependencies, or runtime state inside the container, run `rp enter`

From `dev/rp-api`, use the repo's own scripts when container-backed verification is not enough or when you need a quicker local check:

- `yarn test` for the Jest suite
- `yarn test:watch` while iterating locally
- `yarn build` for TypeScript compilation
- `yarn lint:check` and `yarn format:check` for non-mutating checks
- `yarn verify` for the standard combined validation pass

Use `rp start` instead of `rp start-api` when the API change also needs validation against web or mobile.

### Web

For web work, prefer Docker-backed runtime checks first:

- `rp start-web` if API/infrastructure is already running
- `rp start` if the change should be checked with the whole stack
- `rp logs-web` to inspect web container logs
- `rp enter-web` to debug inside the web container

From `dev/rp-web`, use the monorepo scripts for build and repo-level validation:

- `yarn build` for workspace builds
- `yarn verify` for workspace verification
- `yarn format` for formatting when that is part of the requested change

If the relevant app workspace has its own package scripts, run those from inside `dev/rp-web` or the specific workspace as appropriate.

### Mobile

For mobile work, prefer the containerized flow first:

- `rp start-mobile` to run the mobile container with Expo tunnel mode
- `rp start-mobile-clear` if the Expo cache may be stale
- `rp start-mobile-web` for the containerized web mode
- `rp logs-mobile` to inspect mobile container logs
- `rp enter-mobile` to debug inside the mobile Docker image

From `dev/rp-mobile`, use the app's own scripts when you need repo-local checks or host-native builds:

- `yarn test` for Jest
- `yarn lint` for Expo linting
- `yarn format` for formatting when needed
- `yarn start` for Expo locally
- `yarn web` for Expo web
- `yarn ios` or `yarn android` only when host-native builds are actually needed

### Choosing The Right Level

- If Docker-backed verification exists for the service and covers the change, prefer that first.
- If the change affects service interaction, env wiring, Docker behavior, or the local stack experience, use `rp` commands too.
- Use service-local scripts as a supplement, not the default, unless Docker is unavailable or too indirect for the check you need.
