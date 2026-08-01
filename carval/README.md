# carval — Cookie-Session Auth & NestJS Request Lifecycle

A NestJS + TypeORM + SQLite/Postgres example demonstrating **cookie-session authentication** (no Passport/JWT), plus the "middleware/guard/interceptor/decorator" toolkit Nest offers. The app is a car-value app: users sign up/sign in and submit vehicle price reports.

> Reference implementation of the classic "car value" tutorial. Uses `cookie-session` (signed, not encrypted) and `crypto.scrypt` password hashing.

## What this project demonstrates

| Concept | Where |
| --- | --- |
| **Cookie-session auth** (`req.session.userId`, signed cookie) | `src/app.module.ts` (`cookieSession`), `src/users/middlewares/current-user.middleware.ts` |
| **Custom guard** `AuthGuard` (session check) | `src/guards/auth.guard.ts` |
| **Custom guard** `AdminGuard` (role check) | `src/guards/admin.guard.ts` |
| **Global middleware** `CurrentUserMiddleware` | `src/users/middlewares/current-user.middleware.ts` |
| **Param decorator** `@CurrentUser()` | `src/users/decorators/current-user.decorator.ts` |
| **Interceptor + decorator** `@Serialize(UserDto)` (response shaping) | `src/interceptors/serialize.interceptor.ts` |
| **Password hashing** with `crypto.scrypt` (salt.hash) | `src/users/auth.service.ts` |
| **TypeORM** entities, repositories, migrations (SQLite dev / Postgres prod) | `src/users/user.entity.ts`, `src/reports/report.entity.ts`, `db/data-source.ts` |
| **Env-per-environment** config (`.env.${NODE_ENV}`) | `src/app.module.ts` |

## Architecture

```
                      ┌────────────────────────────────────────────┐
                      │                  AppModule                  │
                      │  ConfigModule (global, .env.${NODE_ENV})   │
                      │  TypeOrmModule.forRoot(dataSourceOptions)  │
                      │  ├── UsersModule   (auth + user CRUD)      │
                      │  ├── ReportsModule (reports + estimates)   │
                      │  └── global APP_PIPE: ValidationPipe        │
                      └────────────────────────────────────────────┘
                                      │
   cookie-session + CurrentUserMiddleware (global, all routes)
                                      │
                                      ▼
                              ┌───────────────┐
                              │  SQLite/Postgres │
                              │  User, Report    │
                              └───────────────┘
```

### Session auth flow

```
Request ──> cookie-session parses+signed cookie -> req.session
          ─> CurrentUserMiddleware reads req.session.userId
          ─> loads user via UsersService.findOne -> sets req.currentUser
          ─> @CurrentUser() decorator returns req.currentUser
          ─> AuthGuard checks req.session.userId (truthy)  [signed-in?]
          ─> AdminGuard checks req.currentUser.admin       [is admin?]
```

### Signup / signin

```mermaid
sequenceDiagram
    participant C as Client
    participant A as AuthService
    participant U as UsersService
    C->>A: POST /auth/signup {email, password}
    A->>U: find(email)
    alt email exists
        A-->>C: 400 User already exists
    end
    A->>A: salt=randomBytes(8) ; hash=scrypt(password,salt,32)
    A->>U: create(email, "salt.hash")
    A-->>C: session.userId = user.id  (signed cookie set)
```

- Passwords are stored as `"<salt>.<hash-hex>"` (scrypt, 32-byte key).
- `POST /auth/signin` re-computes scrypt and compares the hash, then sets `session.userId`.
- `POST /auth/signout` only nulls `session.userId` (it does **not** clear the cookie).

## File tree

```
carval/
├─ .env.example              # template -> copy to .env.development / .env.test
├─ db/data-source.ts         # TypeORM options (sqlite dev/test, postgres prod)
├─ migrations/               # SQL migration (initial schema)
└─ src/
   ├─ main.ts                # thin bootstrap
   ├─ app.module.ts          # ConfigModule, TypeORM, session middleware, APP_PIPE
   ├─ guards/
   │  ├─ auth.guard.ts       # requires req.session.userId
   │  └─ admin.guard.ts      # requires req.currentUser.admin
   ├─ interceptors/serialize.interceptor.ts  # @Serialize(Dto) response shaping
   ├─ users/
   │  ├─ user.entity.ts      # id, email, password, admin, reports
   │  ├─ auth.service.ts     # signup/signin (scrypt)
   │  ├─ users.service.ts    # CRUD
   │  ├─ users.controller.ts # /auth routes + @Serialize(UserDto)
   │  ├─ decorators/current-user.decorator.ts
   │  ├─ interceptors/current-usr.interceptor.ts  # DEAD CODE (unwired)
   │  ├─ middlewares/current-user.middleware.ts   # sets req.currentUser
   │  └─ dtos/               # create/update/user DTOs
   └─ reports/
      ├─ report.entity.ts    # approved, make, model, year, mileage, price
      ├─ reports.service.ts  # create/approve + AVG estimate query
      ├─ reports.controller.ts
      └─ dtos/               # create-report, approve-report, get-estimate, report DTOs
```

## Routes

| Method | Route | Guard | Description |
| --- | --- | --- | --- |
| `GET` | `/` | — | `Hello, this is the NestJS server!` |
| `GET` | `/auth/whoami` | `AuthGuard` | Current user (via `@CurrentUser()`) |
| `POST` | `/auth/signup` | — | Create user, set session |
| `POST` | `/auth/signin` | — | Verify credentials, set session |
| `POST` | `/auth/signout` | — | Null session user |
| `GET` | `/auth/:id` | — | Find one user |
| `GET` | `/auth?email=...` | — | Find user by email (unprotected) |
| `PATCH` | `/auth/:id` | — | Update user (unprotected) |
| `DELETE` | `/auth/:id` | — | Remove user (unprotected) |
| `POST` | `/reports/` | `AuthGuard` + `@Serialize(ReportDto)` | Create report |
| `PATCH` | `/reports/:id` | `AdminGuard` | Approve/reject report |
| `GET` | `/reports?make&model&year&mileage` | — | AVG price estimate |

All `/auth` responses pass through `@Serialize(UserDto)` — `@Expose() id, email` only (password hash never returned).

## Data model

```
User ──1:N──> Report
```

- **User**: `id`, `email` (unique), `password` (scrypt `salt.hash`), `admin` (default `true`!), `reports`
- **Report**: `id`, `approved` (bool), `make`, `model`, `year`, `mileage`, `price`, `user` (FK)

TypeORM entity hooks (`@AfterInsert/@AfterUpdate/@AfterRemove`) log lifecycle events.

## Config / environment

`ConfigModule` loads `.env.${NODE_ENV}` — so development uses `.env.development`, tests use `.env.test`. Copy `.env.example` to both.

| Variable | Used for |
| --- | --- |
| `COOKIE_KEY` | signs the session cookie (`cookie-session` keys) |
| `DATABASE_URL` | only when `NODE_ENV=production` (Postgres) |
| `PORT` | HTTP port (default `3000`) |
| `NODE_ENV` | selects env file + data-source |

`db/data-source.ts`: dev/test use SQLite (`db.sqlite` / `test.sqlite`); production uses Postgres. Dev mode loads **compiled** `.js` entities, so run `pnpm build` before `start:prod`.

## Running it

```bash
cp .env.example .env.development   # fill in COOKIE_KEY
pnpm start:dev                     # or from repo root: pnpm start:carval
```

Quick check (cookie-based session):

```bash
curl -c jar.txt -X POST http://localhost:3000/auth/signup \
  -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"test123"}'
curl -b jar.txt http://localhost:3000/auth/whoami
```

## Tests

- **Unit** (`pnpm test`): 16 tests — services/controllers with `getRepositoryToken(...)` mocks.
- **e2e** (`NODE_ENV=test pnpm test:e2e`): signup → whoami against a throwaway SQLite (`test.sqlite`).

## Gotchas / notes

- `GET /reports` estimate query references a non-existent column (`approve IS TRUE` — entity column is `approved`) and will throw. Fix if you need it.
- `PATCH /reports/:id` uses only `AdminGuard`; on an unauthenticated request `req.currentUser` is `undefined` → 500 instead of 401/403.
- Every new user has `admin = true` by default — intentional in the tutorial, but change the column default for real use.
- `POST /auth/signout` doesn't clear the cookie (only the session user id).
- Several routes are intentionally unguarded (`GET /auth?email=...`, `PATCH/DELETE /auth/:id`).
- `CurrentUserInterceptor` is implemented but never wired (dead code); the middleware supersedes it.
- The `SerializeInterceptor` injects `modifiedByInterceptor`/`timestamp` into `req.body` before validation — harmless because the global `ValidationPipe` strips extras (`whitelist: true`).
- Password comparison in `signin` is not timing-safe.
