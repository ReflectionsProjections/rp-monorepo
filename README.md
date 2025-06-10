# Reflections|Projections Dev Tooling

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
# Start all services
rp start

# Or start just our RP Web and API services
rp start-rp
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
| Supabase Studio | http://localhost:8000 |

### Common Commands (RP)

```bash
# Start all services
rp start

# Start all services in detached mode
rp start-detached

# See the status of all docker containers
rp status

# Or start just our RP Web and API services
rp start-rp

# Stop all services
rp stop

# Stop and remove volumes (WARNING: This will delete all data)
rp clean

# View logs
rp logs

# View API logs
rp logs-rp

# View database logs
rp logs-db

# Access the database
rp db

# Access the Web and API container
rp enter

# Access the database
rp db
```
These commands can also be run with `docker compose` instead of `rp` if you prefer. A reference for common commands using `docker compose` is [below](#common-commands-docker-compose).

### Common Commands (Docker Compose)

```bash
# Start all services
docker compose up --build

# Start all services in detached mode
docker compose up --build -d

# See the status of all docker containers
docker compose ps


# Or start just our RP Web and API services
docker compose up --build rp

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker compose down -v

# View logs
docker compose logs -f rp  # API logs
docker compose logs -f db  # Database logs

# Access the Web and API container
docker compose exec rp bash

# Access the database
docker compose exec db psql -U postgres
```

### Git Operations

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
# or docker compose up --build
```


## Updating Environment Variables

You can customize the development environment by setting your variables in the `.env` file. After making changes, rebuild the Docker environment to apply the updates:

```bash
# Stop all services
rp stop 
# or `docker compose down`

# Rebuild and start the services
rp start
# or `docker compose up --build`
```

## Notes

- Always commit your changes before running `fast-forward.sh` (but use this with caution)
- The database data persists between restarts unless you use `rp clean` (or `docker compose down -v`) as well as delete the data folder in `./volumes/db/` 
- Use `Ctrl+C` to stop the development environment, and then wait for all containers to gracefully shut down. Alternatively, you can use `Ctrl+C` again to force stop the containers. Finally, you can use `rp stop` to stop any remaining services.


