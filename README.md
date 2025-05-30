# Reflections|Projections Dev Tooling

## Initial Setup

1. Clone the repository and navigate to the project directory:
```bash
git clone <repository-url>
cd dev-env
```

2. Run the setup script:
```bash
sh setup.sh
```

## Development

### Starting the Development Environment

```bash
# Start all services
docker compose up --build

# Or start just our RP Web and API services
docker compose up --build rp
```

### Accessing Services

- API: http://localhost:3000
- Site: http://localhost:3001
- Admin: http://localhost:3002
- Info: http://localhost:3003
- Hype: http://localhost:3004
- Supabase Studio: http://localhost:8000

### Common Commands

```bash
# View logs
docker compose logs -f rp  # API logs
docker compose logs -f db  # Database logs

# Access the Web and API container
docker compose exec rp bash

# Access the database
docker compose exec db psql -U postgres

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker compose down -v
```

### Git Operations

```bash
# Fast-forward all repos to main (WARNING: Will lose uncommitted changes)
sh fast-forward.sh
```

## Troubleshooting


### Database Issues
```bash
# Reset the database
docker compose down -v
docker compose up --build
```

### Container Issues
```bash
# Rebuild a specific service
docker compose up --build rp

# View container logs
docker compose logs -f rp
```

## Environment Variables

You can customize the development environment by setting these variables:
```bash
# Database Configuration
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=postgres

# Build Configuration
export BUILD_WEB=true
export BUILD_ADMIN=true
```

## Notes

- Always commit your changes before running `fast-forward.sh` (but use this with caution)
- The database data persists between restarts unless you use `docker compose down -v` as well as delete the data folder in `./volumes/db/` 
- Use `Ctrl+C` to stop the development environment, then type `exit` to leave the container



