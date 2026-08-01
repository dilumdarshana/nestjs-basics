# di — Dependency Injection & Circular Dependencies

A minimal NestJS app that exists purely to show **how the DI container works**: modules, providers, the singleton scope, provider sharing across modules, and resolving **circular dependencies** with `forwardRef`.

> Core reference for "how does DI work in Nest?" — no DB, no auth, no guards. Just `@Injectable()` providers wired through modules and injected into controllers/services.

## What this project demonstrates

| Concept | Where |
| --- | --- |
| **Class providers** + `@Injectable()` | every service (`src/*/*.service.ts`) |
| **Module imports/exports** to share providers | `src/cpu/cpu.module.ts`, `src/disk/disk.module.ts`, `src/power/power.module.ts` |
| **Singleton shared across modules** | `PowerService` is imported by both `CpuModule` and `DiskModule` — both receive the **same instance** |
| **Circular dependency** (module + service level) | `ComputerModule ⇄ NetworkModule` via `forwardRef(...)` |
| **`@Inject(forwardRef(...))`** at service level | `computer.service.ts`, `network.service.ts` |

## Dependency graph

```
                         ComputerModule
                        /       |       \
                CpuModule   DiskModule   forwardRef -> NetworkModule
                   |           |                    |
                   └--> PowerModule <──┘            |
                                                 (circular)
   ComputerModule <---------- forwardRef <---------- NetworkModule
```

- `PowerModule` provides + exports `PowerService` and imports nothing → it is the shared leaf.
- `CpuService` and `DiskService` both inject `PowerService` (same singleton instance).
- `ComputerModule` and `NetworkModule` reference each other:
  - `computer.module.ts`: `imports: [CpuModule, DiskModule, forwardRef(() => NetworkModule)]`
  - `network.module.ts`: `imports: [forwardRef(() => ComputerModule)]`
  - `ComputerService` injects `@Inject(forwardRef(() => NetworkService))`
  - `NetworkService` injects `@Inject(forwardRef(() => ComputerService))`

### How the circular reference is broken

Without `forwardRef`, Nest would fail to resolve one module's dependency on the other at instantiation time. `forwardRef(() => Module)` wraps the reference in a function so it is resolved **lazily** after both modules have been set up, letting the container build the graph first and then inject.

```mermaid
graph LR
    C[ComputerService] -->|@Inject forwardRef| N[NetworkService]
    N -->|@Inject forwardRef| C
    CM[ComputerModule] -->|imports forwardRef| NM[NetworkModule]
    NM -->|imports forwardRef| CM
```

## File tree

```
di/
├─ src/
│  ├─ main.ts                    # bootstraps ComputerModule directly (no AppModule)
│  ├─ computer/
│  │  ├─ computer.module.ts      # imports Cpu, Disk, forwardRef(Network)
│  │  ├─ computer.controller.ts  # GET/POST /computer
│  │  └─ computer.service.ts     # in-memory list, talks to NetworkService
│  ├─ cpu/
│  │  ├─ cpu.module.ts           # imports PowerModule
│  │  └─ cpu.service.ts          # compute(a,b) -> a+b, draws power
│  ├─ disk/
│  │  ├─ disk.module.ts          # imports PowerModule
│  │  └─ disk.service.ts         # getData() -> 'Something'
│  ├─ network/
│  │  ├─ network.module.ts       # imports forwardRef(ComputerModule)
│  │  ├─ network.controller.ts   # GET /network
│  │  └─ network.service.ts      # tracks connected computers
│  └─ power/
│     ├─ power.module.ts         # leaf: provides + exports PowerService
│     └─ power.service.ts        # supplyPower(watt)
└─ test/
   └─ app.e2e-spec.ts            # boots ComputerModule, GET /computer = 200
```

## Routes

| Method | Route | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/computer` | — | `[compute result, 'Something']` from `CpuService` + `DiskService` |
| `POST` | `/computer` | `{ ip, name }` | 201, **empty body** (no return) |
| `GET` | `/network` | — | connected computers list |

## How the pieces fit

1. `GET /computer` → `ComputerController.run()` → `CpuService.compute(10, 20)` (which calls `PowerService.supplyPower(100)`) and `DiskService.getData()` (which calls `PowerService.supplyPower(20)`).
2. `POST /computer` → `ComputerService.addComputer(body)` → pushes to in-memory list → `NetworkService.connectComputer()` copies the whole computer list into its own list.
3. `GET /network` → returns `NetworkService`'s copied list.

The log output makes the DI wiring visible:

```
supplying power 100
Drawing 100W of power from powser service
supplying power 20
Drawing 20W of power from PowserService
```

## Running it

```bash
pnpm start:dev            # or from repo root: pnpm start:di
```

```bash
curl http://localhost:3000/computer
curl -X POST http://localhost:3000/computer -H 'Content-Type: application/json' -d '{"ip":"10.0.0.1","name":"pc-1"}'
curl http://localhost:3000/network
```

## Tests

- **Unit** (`pnpm test`): 4 smoke "should be defined" specs (controller + services). Uses `useValue: {}` stubs for collaborators.
- **e2e** (`pnpm test:e2e`): boots `ComputerModule` (the circular deps resolve!) and asserts `GET /computer` → 200.
- jest `moduleNameMapper` maps `^src/(.*)$` because sources use absolute `src/...` imports (see `tsconfig.json` `baseUrl`).

## Gotchas / notes

- `POST /computer` returns an empty 201 body (the handler has no `return`).
- `NetworkService` copies all computers each call — no dedupe, so repeated POSTs create duplicates.
- `connectedComputers` is typed `string[]` but actually stores `{ ip, name }` objects.
- Log strings have typos (`powser service`, `PowserService`) — intentional silliness, ignore.
- Everything is in-memory; state resets on restart.
