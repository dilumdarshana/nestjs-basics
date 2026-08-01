# auth — JWT Authentication & RBAC

A complete authentication/authorization example built with **NestJS + Passport + JWT + Prisma + Postgres + argon2**. Demonstrates access tokens, refresh tokens, role-based access control (RBAC), and config validation.

## What this project demonstrates

| Concept | Where |
| --- | --- |
| JWT **access token** (short-lived, `Authorization: Bearer`) | `src/auth/strategies/jwt.strategy.ts` |
| JWT **refresh token** (long-lived, sent in request body) | `src/auth/strategies/jwt.refresh.strategy.ts` |
| **Passport strategies** + `@nestjs/passport` guards | `src/auth/guards/*.ts` |
| **RBAC** via a custom `@Roles()` decorator + `RolesGuard` | `src/auth/decorator/roles.decorator.ts`, `src/auth/guards/roles.guard.ts` |
| **Password hashing** with argon2 (never store plain text) | `src/user/user.service.ts` |
| **Prisma** as the data-access layer (Postgres) | `src/prisma/prisma.service.ts`, `prisma/schema.prisma` |
| **Env config validation** on startup (fail fast on missing vars) | `src/config/env.validation.ts` |
| **CORS**, global **ValidationPipe** (whitelist + transform) | `src/main.ts` |

## Architecture

```
                        ┌──────────────────────────────────────────────┐
                        │                  AppModule                    │
                        │  ConfigModule (global, validated)            │
                        │  ├── AuthModule ──> JwtModule (access)       │
                        │  ├── UserModule ──> PrismaService            │
                        │  ├── AdminModule ──> RBAC example            │
                        │  └── PrismaService (shared provider)         │
                        └──────────────────────────────────────────────┘
                                          │
                                          ▼
                                 ┌───────────────┐
                                 │   Postgres    │  (docker, port 5433)
                                 │  commondb     │
                                 │  User, Role   │
                                 └───────────────┘
```

### Request handling pipeline

```
HTTP request
   │
   ├─(global) ValidationPipe        -> validates DTO, strips unknown props
   │
   ├─(route)  Guard                -> JwtAuthGuard / RefreshAuthGuard / RolesGuard
   │
   ├─(route)  Passport strategy    -> verifies token, loads user, attaches req.user
   │
   └─(route)  Controller -> Service -> PrismaService -> Postgres
```

### Guards & strategies

| Guard | Strategy | Token source | Purpose |
| --- | --- | --- | --- |
| `JwtAuthGuard` | `JwtStrategy` (`passport-jwt`) | `Authorization: Bearer <access>` | Protect `/auth/whoami`, `/admin/role`, `/user/:id` |
| `RefreshAuthGuard` | `JWTRefreshStrategy` (`'refresh-jwt'`) | body field `refresh` | Protect `/auth/refresh-token` |
| `RolesGuard` | — (plain guard) | `req.user.role` (set by JwtStrategy) | RBAC: compare against `@Roles(...)` metadata |

> Note: the refresh token is **not** read from a header. `ExtractJwt.fromBodyField('refresh')`
> means the client sends `{ "refresh": "<refresh-token>" }` in the JSON body.

### The RBAC flow

```mermaid
sequenceDiagram
    participant C as Client
    participant G as RolesGuard
    participant R as Reflector
    C->>G: request /admin/role (Bearer access-token)
    G->>R: @Roles('admin') metadata on handler
    G->>G: req.user.role === 'admin' ?
    alt role matches
        G-->>C: allow -> AdminService.createRole
    else role is 'user'
        G-->>C: 403 Forbidden resource
    end
```

## Request flows

### 1. Signup

```mermaid
sequenceDiagram
    participant C as Client
    participant S as AuthService
    participant U as UserService
    participant P as Prisma
    C->>S: POST /auth/signup {name,email,password}
    S->>U: findByEmail(email)
    alt already exists
        S-->>C: 409 Conflict
    end
    S->>U: findRoleIdByName('user')
    U->>P: SELECT role WHERE name='user'
    U->>U: hash(password) with argon2
    U->>P: INSERT user (role_id)
    S-->>C: 201 {message:"User created successfully"}
```

- Roles are seeded by `prisma/seed.ts` (`admin`, `user`). Signup always assigns the `user` role regardless of the `role_id` field in the body.

### 2. Signin → protected route

```mermaid
sequenceDiagram
    participant C as Client
    participant S as AuthService
    participant U as UserService
    participant P as Prisma
    C->>S: POST /auth/signin {username,password}
    S->>U: findByEmail(username) (include Role)
    S->>S: verify(password) with argon2
    S->>S: generateTokens(user)
    S-->>C: 201 {id,name,email,role, accessToken, refreshToken}
    C->>C: store tokens (client side)
    C->>S: GET /auth/whoami  Authorization: Bearer <access>
    S->>S: JwtStrategy.validate(payload) -> load user by sub
    S-->>C: 200 {id,name,email,role_id,role}
```

### 3. Refresh token

```mermaid
sequenceDiagram
    participant C as Client
    participant S as AuthService
    C->>S: POST /auth/refresh-token {"refresh":"<refresh>"}
    S->>S: RefreshAuthGuard -> verify refresh token
    S->>S: load user by sub (validateRefreshToken)
    S->>S: generateTokens(user)
    S-->>C: 201 {id,name,email,role, accessToken, refreshToken}
```

## Data model

```
Role ──< User ──< Url
```

- **Role**: `id`, `name` (unique: `admin`, `user`), `created_at`
- **User**: `id`, `name`, `email` (unique), `password` (argon2 hash), `role_id` FK → `Role`, `created_at`
- **Url**: `id`, `url_long`, `url_short`, `user_id` FK → `User`, `created_at` (kept from an earlier URL-shortener experiment; not used by the auth flow)

## File tree

```
auth/
├─ docker-compose.yml        # Postgres 17 on host port 5433
├─ .env.example              # env template (copy to .env)
├─ prisma/
│  ├─ schema.prisma          # data model
│  ├─ seed.ts                # upserts admin/user roles
│  └─ migrations/            # SQL migrations (applied by db:setup)
└─ src/
   ├─ main.ts                # bootstrap, ValidationPipe, CORS
   ├─ app.module.ts          # root module (ConfigModule global + validate)
   ├─ config/env.validation.ts
   ├─ constants/app.constants.ts     # ROLES = { ADMIN, USER }
   ├─ prisma/prisma.service.ts       # PrismaClient wrapper (Prisma 7, adapter-pg), connect/disconnect lifecycle
   ├─ auth/                  # signin/signup/whoami/refresh-token + JWT/RBAC infra
   │  ├─ auth.controller.ts
   │  ├─ auth.service.ts
   │  ├─ dto/                # SignupPayloadDto, SigninPayloadDto (class-validator)
   │  ├─ guards/             # JwtAuthGuard, RefreshAuthGuard, RolesGuard, LocalAuthGuard(unused)
   │  ├─ strategies/         # JwtStrategy (access), JWTRefreshStrategy (refresh)
   │  ├─ decorator/roles.decorator.ts
   │  ├─ enums/role.enum.ts
   │  └─ config/jwt.refresh.config.ts  # refresh secret/expiry (registerAs)
   ├─ user/                  # UserService (create/find), UserController (GET /user/:id)
   └─ admin/                 # AdminService.createRole, AdminController (RBAC demo)
```

## Routes

| Method | Route | Auth | Body | Result |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/signup` | — | `name`, `email`, `password` | 201, creates user |
| `POST` | `/auth/signin` | — | `username` (email), `password` | 201, token pair |
| `GET` | `/auth/whoami` | `Bearer access` | — | 200, current user |
| `POST` | `/auth/refresh-token` | body `refresh` | `refresh` | 201, new token pair |
| `GET` | `/user/:id` | `Bearer access` | — | 200, user (incl. password hash — see gotchas) |
| `POST` | `/admin/role` | `Bearer access` + `role=admin` | `name` | 201, creates role |

## Environment variables (`.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | runtime mode | `development` |
| `APP_PORT` | HTTP port | `3000` |
| `DATABASE_URL` | Postgres connection string | `postgresql://myuser:password@localhost:5433/commondb?schema=public` |
| `JWT_SECRET` | signs access tokens | random base64 |
| `JWT_EXPIRATION` | access-token TTL | `3600s` |
| `JWT_REFRESH_SECRET` | signs refresh tokens | random base64 |
| `JWT_REFRESH_EXPIRATION` | refresh-token TTL | `30d` |

`src/config/env.validation.ts` uses class-validator to fail fast at boot if any of these are missing.

## Running it

```bash
# 1. Postgres 17 (own container, host port 5433 so it can't clash with other DBs)
docker compose up -d

# 2. Apply migrations + seed roles (admin, user)
pnpm db:setup

# 3. (optional) create the demo admin user: admin@example.com / 1qaz!QAZ
pnpm db:admin

# 4. Start
pnpm start:dev            # or from repo root: pnpm start:auth
```

> **How an admin account exists:** signup always assigns the `user` role
> (`auth.service.ts` hardcodes `ROLES.USER`), and `POST /admin/role` requires an
> existing admin token — so there is no API path to create an admin. `pnpm db:admin`
> fills that gap: it upserts `admin@example.com` with the password `1qaz!QAZ` and the
> `admin` role (idempotent — safe to re-run; it also resets the password).

Quick manual check:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"username":"you@example.com","password":"test123"}' | jq -r .accessToken)

curl -s http://localhost:3000/auth/whoami -H "Authorization: Bearer $TOKEN"
```

### `test.rest` tokens stay out of git

The REST Client file uses `{{$dotenv VAR}}` placeholders (`ACCESS_TOKEN`,
`REFRESH_TOKEN`, `ADMIN_ACCESS_TOKEN`). Real tokens are **never committed** —
they live in the gitignored `.env`:

1. Start the app and sign in (`admin@example.com` / `1qaz!QAZ` for admin).
2. Copy the tokens from the response into `auth/.env`:

   ```
   ACCESS_TOKEN=eyJ...
   REFRESH_TOKEN=eyJ...
   ADMIN_ACCESS_TOKEN=eyJ...   # same as ACCESS_TOKEN when signed in as admin
   ```

3. Send requests from `test.rest` — the extension injects the tokens
   automatically. When they expire, just refresh them in `.env`.

## Tests

- **Unit** (`pnpm test`): 15 tests — services, controllers, guards with mocked Prisma/UserService (jest 30).
- **e2e** (`pnpm test:e2e`): full signup → signin → whoami against a **real Postgres** (start it first).

## Gotchas / notes

- `LocalAuthGuard`/`LocalStrategy` are not implemented — signin validates the password directly in `AuthService` (the guard is commented out).
- `GET /user/:id` returns the argon2 password hash. In production this endpoint would exclude the password (the serializer is the point of the `carval` project).
- **TypeScript 6**: `@types` packages are no longer auto-discovered, so `tsconfig.json` sets an explicit `"types": ["node", "jest", "express", "supertest"]`.
- **JWT secrets** are read via `ConfigService` (not raw `process.env`) in `auth.module.ts`, so they resolve only after `ConfigModule.forRoot()` loads `.env`.
- **Prisma 7 generated client** lives in `src/generated/prisma` (gitignored, regenerated by `prisma generate`). The jest `transform` only matches `.ts` so generated `.js` files are never transpiled; `nest-cli.json` `assets` copies them into `dist/src/generated` for the compiled build.
- The `SignupPayloadDto.role_id` is `@IsString()` yet typed `number`; it's ignored anyway since signup forces the `user` role.
- Refresh tokens are not stored/revoked server-side — they are just long-lived JWTs. A production design would keep a token table and rotation/revocation logic.
