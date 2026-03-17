# Reflections | Projections Portal

This repository orchestrates the development environment for the Reflections | Projections codebases. It provides a unified way to set up the API, Web, and Mobile repositories, and to start and manage the containerized API, Web, and Mobile services.

## Architecture

- **API Service**: Runs from `./dev/rp-api/` with its own Docker setup (includes all self-hosted Supabase infrastructure)
- **Web Service**: Runs all sites from the Monorepo in `./dev/rp-web/` with its own Docker setup  
- **Mobile App**: Runs from `./dev/rp-mobile/` inside a Dockerized Expo development container
- **Shared Infrastructure**: Database, Supabase Studio, Kong, REST API, and Meta services (managed by the API repo)

## Initial Setup

1. Clone the repository and navigate to the project directory:
```bash
git clone <repository-url>
cd dev-env
```

2. Run the setup script (and follow the prompts):
```bash
sh setup.sh
```

3. Reach out to your Dev Chairs for the `.env` file

## Development

### Starting the Development Environment

```bash
# Start all services (shows only API + Web + Mobile logs for cleaner output)
rp start

# Start all services (shows all logs including infrastructure)
rp start-verbose
# or short form:
rp start-v

# Start all services in detached mode
rp start-detached
# or short form:
rp start-d

# Start just the API service (shows only API logs)
rp start-api

# Start just the API service (shows all logs including infrastructure)
rp start-api-v

# Start just the Web service
rp start-web

# Start the mobile Expo container
rp start-mobile

# Start the mobile Expo container with a cleared cache
rp start-mobile-clear

# Start the mobile app in web mode
rp start-mobile-web
```

### Accessing Services

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Site | http://localhost:3001 |
| Admin | http://localhost:3002 |
| Info | http://localhost:3003 |
| Hype | http://localhost:3004 |
| Sponsor | http://localhost:3005 |
| Dashboard | http://localhost:3006 |
| Supabase Studio | http://localhost:8000 |
| Expo Metro | http://localhost:8081 |
| Expo Web | http://localhost:19006 |

### Quick Start Commands 

```bash
# Start all services (shows only API + Web + Mobile logs, add -v for more logs)
rp start

# Enter the API container
rp enter

# View logs for everything
rp logs

# Update .env files based on the main .env file
rp update

# Start the mobile container
rp start-mobile

# Stop all services
rp stop
```

### All Commands

```bash
# Start all services (shows only API + Web + Mobile logs)
rp start

# Start all services (shows all logs)
rp start-verbose  # or rp start-v

# Start all services in detached mode
rp start-detached  # or rp start-d

# Start just the API service (shows only API logs)
rp start-api

# Start just the API service (shows all logs)
rp start-api-v

# Start just the Web service (requires API to be running)
rp start-web

# Start the mobile Expo container
rp start-mobile

# Start the mobile Expo container with a cleared cache
rp start-mobile-clear

# Start the mobile app in web mode via Docker
rp start-mobile-web

# Update .env files
rp update

# See the status of all docker containers
rp status

# Stop all services
rp stop

# Stop and remove volumes (WARNING: This will delete all data)
rp clean

# View logs
rp logs

# View API logs
rp logs-api

# View Web logs
rp logs-web

# View Mobile logs
rp logs-mobile

# View infrastructure logs (db, studio, kong, rest, meta)
rp logs-infra

# Access the database
rp db

# Enter the API container
rp enter  # or rp enter-api

# Enter the Web container
rp enter-web

# Open a shell in the mobile Docker image
rp enter-mobile
```

These commands can also be run with `docker compose` instead of `rp` if you prefer. A reference for common commands using `docker compose` is [below](#common-commands-docker-compose).

### Common Commands (Docker Compose)

```bash
# Start all services (shows only API + Web + Mobile logs)
docker compose up --build --attach api --attach web --attach mobile

# Start all services (shows all logs)
docker compose up --build

# Start all services in detached mode
docker compose up --build -d

# Start just the API service (shows only API logs)
docker compose up --build --attach api api db studio kong rest meta

# Start just the API service (shows all logs)
docker compose up --build api db studio kong rest meta

# Start just the Web service
docker compose up --build web

# Start the mobile Expo container
docker compose up --build mobile

# Start the mobile Expo container with a cleared cache
MOBILE_COMMAND=start-clear docker compose up --build mobile

# Start the mobile app in web mode via Docker
MOBILE_COMMAND=start-web docker compose up --build mobile

# See the status of all docker containers
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker compose down -v

# View logs
docker compose logs -f api  # API logs
docker compose logs -f web  # Web logs
docker compose logs -f mobile  # Mobile logs
docker compose logs -f db studio kong rest meta  # Infrastructure logs

# Enter the API container
docker compose exec api bash

# Enter the Web container
docker compose exec web bash

# Open a shell in the mobile Docker image
docker compose run --rm mobile bash

# Access the database
docker compose exec db psql -U postgres
```

### Git Operations

You can manage the branches in each repo by going into the repo in `dev/rp-api`, `dev/rp-web`, and `dev/rp-mobile` and running `git branch` to see the branches and `git checkout <branch-name>` to switch to a branch. 

Should you need to fast-forward all repos to main, you can run the following script. This will lose any uncommitted changes.

```bash
# Fast-forward all repos to main (WARNING: Will lose uncommitted changes)
sh fast-forward.sh
```

## Troubleshooting

### Container Issues
```bash
# Reset the database
rp clean
# or docker compose down -v

rp start
# or docker compose up --build --attach api --attach web --attach mobile
```

### Service Dependencies
- Use `rp start` to start everything together with clean logs
- Use `rp start-verbose` (or `rp start-v`) if you need to see infrastructure logs for debugging
- Or use `rp start-api` first, then `rp start-web` if you want to start them separately

## Updating Environment Variables

You can customize the development environment by setting your variables in the `.env` file. `rp update` copies that file into any available local API, Web, and Mobile repos. After making changes, rebuild the Docker environment or restart the Expo server to apply the updates:

```bash
# Stop all services
rp stop 
# or `docker compose down`

# Rebuild and start the services
rp start
# or docker compose up --build --attach api --attach web --attach mobile
```

For API targeting, `ENV` is the primary switch:

- `ENV=DEVELOPMENT` makes the wrapper web apps and mobile app use the local development API by default
- `ENV=PRODUCTION` makes the wrapper web apps and mobile app use `https://api.reflectionsprojections.org` by default
- `API_URL` is only used by the mobile app outside production, for cases like a LAN IP target for Expo Go

## Notes

- Always commit your changes before running `fast-forward.sh` (but use this with caution)
- The database data persists between restarts unless you use `rp clean` (or `docker compose down -v`)
- Use `Ctrl+C` to stop the development environment, and then wait for all containers to gracefully shut down. Alternatively, you can use `Ctrl+C` again to force stop the containers. Finally, you can use `rp stop` to stop any remaining services.
- The API service includes all Supabase infrastructure (db, studio, kong, rest, meta), so starting it will start everything needed.
- By default, most commands show clean logs focused on your development. Use `-verbose` or `-v` variants to see all logs including infrastructure.
- Use `rp logs-infra` to view infrastructure logs if needed for debugging.
- `rp enter` and `rp enter-api` both enter the API container since that's most commonly needed.
- `rp start-mobile` and `rp start-mobile-clear` run Expo inside Docker using Expo tunnel mode so the QR code is reachable from your phone.
- `rp start-mobile-web` serves the Expo web build from the mobile container on port `19006`.
- The root `.env` is the source of truth for wrapper-managed env vars; `rp update` and `rp start*` copy it into available repos under `dev/`.
- Direct edits to `dev/rp-api/.env`, `dev/rp-web/.env`, or `dev/rp-mobile/.env` are temporary in the wrapper flow and will be overwritten.
