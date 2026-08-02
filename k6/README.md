# k6 — Load / Stress / Spike / Soak Testing with Grafana k6

> **New to k6?** Read [CONCEPTS.md](./CONCEPTS.md) first — it explains the k6 concepts (VUs, executors, stages, thresholds, tags, etc.) grounded in this project's code. This README covers *how to run* the tests.

A NestJS app that exists to be **load-tested by Grafana k6** (Docker image). k6 is **not** an npm dependency — tests run in a `grafana/k6` Docker container; only `@types/k6` is installed for editor/type support.

## What this project demonstrates

| Test type | Where | Run |
| --- | --- | --- |
| **Load** (ramp to 50 VUs, hold, ramp down) | `test/k6/load-test.ts` | `pnpm --filter k6 k6:test:load` |
| **Stress** (ramp 100 → 200 → 500 VUs) | `test/k6/stress-test.ts` | `pnpm --filter k6 k6:test:stress` |
| **Spike** (2,000 VUs burst) | `test/k6/spike-test.ts` | `pnpm --filter k6 k6:test:spike` |
| **Soak** (200 VUs × 4h to catch memory leaks) | `test/k6/soak-test.ts` | `pnpm --filter k6 k6:test:soak` |
| **Shared flows + data** | `test/k6/common.ts`, `test/k6/users.json` | — |
| **k6 via Docker** (`grafana/k6:latest`) | `Dockerfile.k6`, `docker-compose.k6.yml` | — |

The Nest app itself is a trivial hello/signin API — it's the **target** for the tests, not the point.

## How it runs

```
[you] docker compose -f docker-compose.k6.yml run k6 run /scripts/<scenario>.ts
         │
         ▼
   grafana/k6:2.1.0 container (bridge + host.docker.internal)
         │  hits http://host.docker.internal:3000
         ▼
   NestJS app (pnpm start:k6) — GET / and POST /signin
```

### The load-test scripts (`test/k6/*.ts`)

- **`common.ts`** — shared helpers: `BASE_URL` (defaults to `http://host.docker.internal:3000`, overridable via `-e BASE_URL=...`), the `users` `SharedArray`, and the `signinFlow()` / `helloFlow()` request functions (each tagged `endpoint:signin` / `endpoint:hello`).
- **`load-test.ts`** — default: `ramping-vus` to 50 VUs, hold 1m, ramp down.
- **`stress-test.ts`** — ramps 100 → 200 → 500 VUs in levels to find the breaking point.
- **`spike-test.ts`** — 30s warmup → 1m at **2,000 VUs** → recover.
- **`soak-test.ts`** — 200 VUs for **4 hours** (memory-leak hunting).
- Each scenario defines its own `options` (executor + stages + thresholds) and a `default` that calls the shared flows. `users.json` (3 dummy users) is loaded via `SharedArray`.

## Files

```
k6/
├─ Dockerfile.k6            # FROM grafana/k6:latest ; COPY test/k6 -> /scripts
├─ docker-compose.k6.yml    # k6 service, network_mode: host, ./test/k6 mounted
├─ src/
│  ├─ app.controller.ts     # GET / , POST /signin
│  ├─ app.service.ts
│  ├─ app.module.ts
│  ├─ dto.ts                # SigninDto (unvalidated)
│  └─ main.ts
└─ test/k6/
   ├─ common.ts             # shared BASE_URL, users, signinFlow/helloFlow
   ├─ load-test.ts          # load scenario (default)
   ├─ stress-test.ts        # stress scenario
   ├─ spike-test.ts         # spike scenario
   ├─ soak-test.ts          # soak scenario
   └─ users.json            # dummy login data
```

## Routes

| Method | Route | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/` | — | `Hello World!` |
| `POST` | `/signin` | `{ username, password }` | 200, echoes the body |

## Running it

```bash
# terminal 1: start the target app
pnpm start:k6

# terminal 2: build + run a k6 load test (load / stress / spike / soak)
pnpm --filter k6 k6:build
pnpm --filter k6 k6:test:load      # or :stress, :spike, :soak

# point k6 at a deployed instance instead of the local app:
pnpm --filter k6 k6:test:load -- -e BASE_URL=https://api.example.com
```

## Tests

- **Unit** (`pnpm test`): `GET /` → `Hello World!`.
- **e2e** (`pnpm test:e2e`): `GET /` → 200. (The `test/k6/*.ts` files are deliberately **not** picked up by jest — unit config roots at `src/`, e2e regex is `.e2e-spec.ts$`.)

## Gotchas / notes

- **Networking**: the compose file uses bridge networking with `extra_hosts: host.docker.internal:host-gateway`, so the container reaches the host app via `host.docker.internal` on Linux, macOS, and Windows alike. `BASE_URL` defaults to that; override with `-e BASE_URL=...` to target a deployed instance.
- **Local imports need the extension**: k6 requires the full filename for local module imports, so scenario files import `./common.ts` (not `./common`).
- The k6 Docker image is pinned to `grafana/k6:2.1.0`; only `@types/k6` lives in `package.json`.
