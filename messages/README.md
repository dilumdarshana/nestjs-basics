# messages — Layered CRUD with a JSON-file Store

The simplest project in the workspace: a **Controller → Service → Repository** layered CRUD app that persists to a **JSON file** instead of a database. Perfect for studying Nest's canonical layering and DI without any ORM or DB setup.

## What this project demonstrates

| Concept | Where |
| --- | --- |
| **Three-layer architecture** (controller / service / repository) | `src/messages/*.ts` |
| **JSON file as persistence** (`fs/promises` read + write) | `src/messages/messages.repository.ts` |
| **DTO validation** with `class-validator` + global `ValidationPipe` | `src/messages/dtos/create-message.dto.ts`, `src/main.ts` |
| **Constructor DI** across layers | `MessagesController → MessageService → MessageRepository` |
| **`NotFoundException`** for missing resources | `src/messages/messages.controller.ts` |

## Architecture

```
HTTP ──> MessagesController ──> MessageService ──> MessageRepository
            (parse HTTP)          (business logic)   (reads/writes messages.json)
                                                          │
                                              ┌───────────▼───────────┐
                                              │ messages.json (repo)  │
                                              │ {"12":{"id":12,...}}  │
                                              └───────────────────────┘
```

- The repository is the **only** layer that touches the file system.
- The service is a thin facade; in a real app business rules would live here.
- The controller handles HTTP concerns (params, DTO, 404).

## File tree

```
messages/
├─ messages.json              # the "database" (keyed by id)
└─ src/
   ├─ main.ts                 # global ValidationPipe
   └─ messages/
      ├─ messages.module.ts   # providers: MessageService, MessageRepository
      ├─ messages.controller.ts
      ├─ messages.service.ts
      ├─ messages.repository.ts
      └─ dtos/create-message.dto.ts   # @IsString() @MinLength(1)
```

## Routes

| Method | Route | Body/Param | Response |
| --- | --- | --- | --- |
| `GET` | `/messages` | — | all messages (JSON object) |
| `POST` | `/messages` | `{ content }` | 201, empty body |
| `GET` | `/messages/:id` | `id` | one message, else `404 Message <id> not found` |

```bash
curl -X POST http://localhost:3000/messages \
  -H 'Content-Type: application/json' -d '{"content":"hello"}'
curl http://localhost:3000/messages
curl http://localhost:3000/messages/12
```

## Running it

```bash
pnpm start:dev            # or from repo root: pnpm start:messages
```

> Start from the project root — the repository reads `./messages.json` relative to the **process working directory** (see Gotchas).

## Tests

- **Unit** (`pnpm test`): 1 spec (controller "should be defined", service stubbed).
- **e2e** (`pnpm test:e2e`): boots `MessagesModule`, asserts `GET /messages` → 200. No POST tests.

## Gotchas / notes

- **CWD-dependent path**: `MessageRepository` uses the relative path `'./messages.json'`, resolved against where the process runs. `pnpm start:dev` from the project folder works; a different CWD breaks it.
- IDs are `Math.floor(Math.random() * 999)` — collisions silently overwrite existing messages.
- No error handling for a missing/corrupt `messages.json` (would 500).
- `findAll()` is typed `Promise<{ conent: string[] }>` (typo) but actually returns the parsed record — the annotation doesn't match reality.
- `POST` returns an empty 201 body.
- The `ValidationPipe` is registered in `main.ts` only, so the e2e test (which boots the module directly) doesn't validate.
