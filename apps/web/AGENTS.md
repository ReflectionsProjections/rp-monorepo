# Web Workspace Guide

This directory contains the unified Reflections | Projections website. Treat it as one Vite app with multiple routed sections, not as several separate web apps.

## Scope

Work here for:

- website routing and layouts
- shared web UI components
- section-specific web features such as home, admin, info, sponsor, dashboard, and hype
- web auth flow
- Vite, TypeScript, ESLint, and web-only tooling

Do not edit the repo root from here unless the task is actually about monorepo or infrastructure behavior.

## Source Layout

The current source tree is organized as a single-site workspace:

- `app`: app shell, router ownership, top-level routes, and section code
- `app/sections`: route-area code such as `home`, `admin`, `info`, `sponsor`, `dashboard`, and `hype`
- `components`: reusable web UI shared across sections
- `hooks`: reusable cross-section hooks
- `constants`: shared config, route constants, option lists, and mappings
- `api`: typed API helpers, auth helpers, and API types
- `lib`: general web utilities
- `assets`: imported assets such as fonts
- `public`: static assets served by Vite

Do not recreate the old `src/`, `shared/`, or `apps/*` structure inside this workspace.

## Architecture Rules

- `app/Root.tsx` is the root router owner for the site.
- Keep auth callback and refresh handling at the site root unless a route explicitly needs section-specific presentation.
- Prefer placing section-specific code inside `app/sections/<section>` even if it includes local hooks or components.
- Move code to top-level `components`, `hooks`, `constants`, `api`, or `lib` only when it is genuinely shared across sections.
- Preserve the path-based site model:
  - `/`
  - `/admin/*`
  - `/info/*`
  - `/sponsor/*`
  - `/dashboard/*`
  - `/hype/*`

## Imports

Use the current web aliases defined in `tsconfig.json` and `vite.config.ts`:

- `@app/*`
- `@components/*`
- `@hooks/*`
- `@constants/*`
- `@assets/*`
- `@api/*`
- `@lib/*`
- `@types/*`

Prefer relative imports only for very local files within the same feature area.

## Commands

Run commands from `apps/web`:

- `yarn dev`
- `yarn build`
- `yarn preview`
- `yarn type-check`
- `yarn lint`
- `yarn format:check`
- `yarn verify`

## Editing Guidance

- Keep changes scoped to `apps/web` unless the task explicitly requires cross-repo edits.
- Be careful with static asset paths in `public`; many sections depend on exact URL paths.
- When changing routing, verify both direct loads and in-app navigation.
- Prefer fixing real lint errors first; warnings in this workspace are currently broader and should not be "fixed" opportunistically unless they are part of the task.

## Verification Expectations

For most web changes, prefer some combination of:

- `yarn type-check`
- `yarn build`
- `yarn lint`

Use `yarn verify` when you want the full workspace check.
