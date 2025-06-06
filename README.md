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

3. Reach out to your Dev Chairs for the `.env` file

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


### Container Issues
```bash
# Reset the database
docker compose down -v
docker compose up --build
```


## Updating Environment Variables

You can customize the development environment by setting your variables in the `.env` file. After making changes, rebuild the Docker environment to apply the updates:

```bash
# Stop all services
docker compose down

# Rebuild and start the services
docker compose up --build
```

## Notes

- Always commit your changes before running `fast-forward.sh` (but use this with caution)
- The database data persists between restarts unless you use `docker compose down -v` as well as delete the data folder in `./volumes/db/` 
- Use `Ctrl+C` to stop the development environment, then type `exit` to leave the container



