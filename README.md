# NestJS Concepts

A pnpm workspace of standalone NestJS feature projects. Each folder is an
independent NestJS app demonstrating one concept, so you can study them in
isolation and run them independently.

## Workspace layout

| Folder | Concept | Docs |
| --- | --- | --- |
| `auth` | JWT + refresh-token auth, RBAC, Passport, Prisma, config validation, CORS | [README](auth/README.md) |
| `carval` | Cookie-session auth, guards, middlewares, interceptors, decorators, TypeORM | [README](carval/README.md) |
| `di` | Dependency injection, shared services across modules, `forwardRef` circular deps | [README](di/README.md) |
| `event_emitter` | Event-driven pattern with `@nestjs/event-emitter` | [README](event_emitter/README.md) |
| `execution_order` | Middleware → Guard → Interceptor → Pipe → Controller → Service execution order | [README](execution_order/README.md) |
| `k6` | k6 load/stress/spike/soak testing with Docker | [README](k6/README.md) |
| `messages` | Simple CRUD over a JSON file store (DI usage) | [README](messages/README.md) |
| `prometheus` | Prometheus + Grafana monitoring with `@willsoto/nestjs-prometheus` | [README](prometheus/README.md) |

Every project has a **detailed README** (architecture diagrams, request flows,
routes, data model, run instructions, and gotchas) — open the links above for the
concept you want to understand.

## Requirements

- Node.js >= 22
- pnpm (>= 10)

## Install

```bash
pnpm install
```

This installs all workspace packages and generates a single `pnpm-lock.yaml`.

## Common commands (run from the root)

```bash
pnpm build          # build all packages
pnpm test           # run all unit tests
pnpm test:e2e       # run all e2e tests
pnpm lint           # lint all packages
pnpm format         # format all packages with prettier
```

Run a single feature (one at a time) from the root:

```bash
pnpm start:auth
pnpm start:carval
pnpm start:di
pnpm start:event-emitter
pnpm start:execution-order
pnpm start:k6
pnpm start:messages
pnpm start:prometheus
```

Or target any package script with `--filter`:

```bash
pnpm --filter auth test
pnpm --filter carval start:dev
pnpm --filter di build
```

## Running a project

Each project is a regular NestJS app with its own `nest-cli.json`, `package.json`
and `src/`. For example:

```bash
pnpm --filter auth start:dev
```

### Notes per project

- **carval** reads a single `.env` via `ConfigModule`. Copy `carval/.env.example`
  to `.env` and fill in the values before running.
- **auth** uses Prisma + Postgres. Run `pnpm --filter auth exec prisma migrate deploy`
  against a running Postgres (see `auth/docker-compose.yml`), then copy
  `auth/.env.example` to `.env`. The `auth` e2e suite requires Postgres.
- **k6** runs load tests in a Docker k6 image (no npm `k6` dependency needed).
  Pick a scenario — load / stress / spike / soak:
  ```bash
  pnpm --filter k6 k6:build
  pnpm --filter k6 k6:test:load      # or :stress, :spike, :soak
  ```
  See `k6/CONCEPTS.md` for the k6 concepts (VUs, executors, stages, thresholds).
- **prometheus** ships a `docker-compose.yml` with Prometheus + Grafana
  (Grafana's datasource is auto-provisioned). Start it with
  `pnpm --filter prometheus docker:up`. See `prometheus/CONCEPTS.md` for the
  Prometheus/Grafana concepts.

## Shared configuration

To keep the repo maintainable, tooling config lives at the root and is shared by
all packages:

- `tsconfig.base.json` — compiler options; each package's `tsconfig.json`
  extends it (`../tsconfig.base.json`) and may override specific flags.
- `eslint.config.mjs` — shared ESLint flat config.
- `.prettierrc` — shared Prettier options.
- `.gitignore` — covers every package (node_modules, dist, env files, sqlite DBs).

Adding a new concept project:

```bash
mkdir my-concept && cd my-concept
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
pnpm add -D @nestjs/cli @nestjs/schematics @nestjs/testing typescript ts-loader ts-node tsconfig-paths @types/node @types/express jest ts-jest @types/jest jest-environment-node jest-mock supertest @types/supertest eslint typescript-eslint @eslint/js @eslint/eslintrc globals eslint-config-prettier eslint-plugin-prettier prettier @swc/cli @swc/core source-map-support
```

…then create `nest-cli.json`, `tsconfig.json` (extending `../tsconfig.base.json`),
and add the folder to `packages` in `pnpm-workspace.yaml`.

## Related

[Blog post: NestJS basic concepts](https://dilumdar.blogspot.com/2024/04/nestjs-basic-concepts.html)
