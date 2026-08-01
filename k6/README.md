# k6 — Load / Stress / Spike / Soak Testing with Grafana k6

A NestJS app that exists to be **load-tested by Grafana k6** (Docker image). k6 is **not** an npm dependency — tests run in a `grafana/k6` Docker container; only `@types/k6` is installed for editor/type support.

## What this project demonstrates

| Test type | Where |
| --- | --- |
| **Load / smoke** (active default: 10 VUs × 5s) | `test/k6/load-test.spec.ts` |
| **Stress** (ramp 100 → 500 VUs, commented out) | same file |
| **Spike** (2,000 VUs, commented out) | same file |
| **Soak** (200 VUs × 4h to catch memory leaks, commented out) | same file |
| **k6 via Docker** (`grafana/k6:latest`) | `Dockerfile.k6`, `docker-compose.k6.yml` |
| **Test data** via k6 `SharedArray` | `test/k6/users.json` |

The Nest app itself is a trivial hello/signin API — it's the **target** for the tests, not the point.

## How it runs

```
[you] docker compose -f docker-compose.k6.yml run k6 run /scripts/load-test.spec.ts
         │
         ▼
   grafana/k6:latest container (network_mode: host)
         │  hits http://localhost:3000
         ▼
   NestJS app (pnpm start:k6) — GET / and POST /signin
```

### The load-test script (`test/k6/load-test.spec.ts`)

- **Default (load):** `vus: 10`, `duration: '5s'`.
- **Commented-out alternatives** to swap in manually:
  - *Stress* — stages ramping 100 → 500 VUs then cooling down.
  - *Spike* — 30s warmup → 1m at **2,000 VUs** → cooldown.
  - *Soak* — 200 VUs for **4 hours** (memory-leak hunting).
- Each request is tagged (`endpoint: hello` / `endpoint: users`) and assertions (`checks`) verify status and response time.
- `users.json` (3 dummy users) is loaded via `SharedArray`.

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
   ├─ load-test.spec.ts     # the k6 scenario (NOT a jest test)
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

# terminal 2: build + run the k6 load test
pnpm --filter k6 k6:build
pnpm --filter k6 k6:test
```

## Tests

- **Unit** (`pnpm test`): `GET /` → `Hello World!`.
- **e2e** (`pnpm test:e2e`): `GET /` → 200. (The `test/k6/*.spec.ts` file is deliberately **not** picked up by jest — unit config roots at `src/`, e2e regex is `.e2e-spec.ts$`.)

## Gotchas / notes

- **Threshold mismatch**: the `endpoint:signin` threshold (`p(95) < 1ms`) references a tag that doesn't exist — the signin request is tagged `endpoint: users`. The threshold never matches anything.
- **Impossible check**: `'sigin response time < 400ms'` actually asserts `timings.duration < 1` (i.e. < 1ms), which always fails. Watch for it in results.
- **Networking**: compose uses `network_mode: "host"` (Linux-friendly). On macOS/Windows the `localhost:3000` target may not reach the host app; the bridge alternative is commented out in the compose file.
- The stress/spike/soak stages are commented out — swap them into the `options` block to use them.
- The k6 Docker image is `grafana/k6:latest`; only `@types/k6` lives in `package.json`.
