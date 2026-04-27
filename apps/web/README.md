# Reflections | Projections Web Workspace

This workspace is organized as a single website codebase instead of a set of pseudo-app workspaces. Route-owned code lives under `app/sections/*`, and cross-site code lives in top-level concern-based directories.

## Getting Started

From `apps/web`:

```bash
yarn
yarn dev
```

## Common Scripts

These commands assume you are in `apps/web`.

| Task | Command |
| --- | --- |
| Install dependencies | `yarn` |
| Start the website | `yarn dev` |
| Build the website | `yarn build` |
| Type-check | `yarn type-check` |
| Lint | `yarn lint` |
| Verify | `yarn verify` |
| Format workspace files | `yarn format` |

## Workspace Structure

- `app/`: app shell, router, auth routes, and site sections
- `components/`: reusable cross-site UI
- `hooks/`: reusable cross-site hooks
- `constants/`: shared constants, static config, and option lists
- `assets/`: shared imported assets and fonts
- `api/`: typed API client, auth helpers, and API type wrappers
- `lib/`: pure shared utilities
- `types/`: cross-cutting app-owned types
- `public/`: static assets, still grouped by public URL area where useful

Placement rules:

- Put section-specific code in `app/sections/<section>`, even if it contains components or hooks.
- Put only truly reusable UI in `components/` and reusable logic in `hooks/`.
- Put route/path constants, config, and shared data tables in `constants/`.

## Environment Variables

The workspace loads environment variables from the monorepo root `.env`.

Example:

```bash
VITE_DEV_JWT=<your-jwt>
```

## API Route Types

When the frontend needs a new typed API route, update `api/types.ts`.

- Add the route to `APIRoutes`
- Use `:paramName` syntax for dynamic segments
- Define any new request or response types alongside the route shape
- Use the `path()` helper when building dynamic URLs
