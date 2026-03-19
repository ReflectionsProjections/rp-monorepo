# Reflections | Projections Web Workspace

This workspace contains the web apps and shared frontend package for Reflections | Projections.

## Production Sites

- [reflectionsprojections.org](https://reflectionsprojections.org)
- [hype.reflectionsprojections.org](https://hype.reflectionsprojections.org)
- [admin.reflectionsprojections.org](https://admin.reflectionsprojections.org)
- [sponsor.reflectionsprojections.org](https://sponsor.reflectionsprojections.org)

## Getting Started

From `apps/web`:

```bash
yarn
yarn prepare
```

## Common Scripts

These commands assume you are in `apps/web`.

| Task | Command |
| --- | --- |
| Install dependencies | `yarn` |
| Start an app | `yarn workspace <app-name> dev` |
| Build an app | `yarn workspace <app-name> build` |
| Lint an app | `yarn workspace <app-name> lint` |
| Verify all workspaces | `yarn verify` |
| Format workspace files | `yarn format` |
| Add a dependency to an app | `yarn workspace <app-name> add <package-name>` |

Example:

```bash
yarn workspace @rp/hype dev
```

## Workspace Structure

- `apps/`: individual web apps
- `apps/template/`: reusable app template files
- `shared/`: shared components, utilities, and API typing helpers

Import shared code with:

```tsx
import { <component-name> } from "@rp/shared";
```

## Environment Variables

Web apps load environment variables from their local `.env` first, then fall back to the shared root `.env`.

Example:

```bash
VITE_DEV_JWT=<your-jwt>
```

## Running a Specific App

You can run an app either from `apps/web`:

```bash
yarn workspace @rp/hype dev
```

Or from the app directory itself:

```bash
cd apps/hype
yarn dev
```

## Dependency Versions

If the root `package.json` already specifies a dependency version, an app can inherit that version by using `"*"` in its `package.json`.

## API Route Types

When the frontend needs a new typed API route, update `shared/src/api/types.ts`.

- Add the route to `APIRoutes`
- Use `:paramName` syntax for dynamic segments
- Define any new request or response types alongside the route shape
- Use the `path()` helper from `@rp/shared` when building dynamic URLs
