# AGENTS.md

Guidelines for AI agents (and humans) working in this repository.

## Naming conventions

- **File names**: use `kebab-case` (dash-separated) for multi-word file names.
  - ✅ `signin-payload.dto.ts`, `jwt-auth.guard.ts`, `create-role.dto.ts`
  - ❌ `signin_payload.dto.ts`, `jwt_auth.guard.ts`
- Keep the dot-classifier suffix for NestJS file types: `.module`, `.controller`, `.service`, `.guard`, `.strategy`, `.dto`, `.enum`, `.spec`.
- **Do not use underscores or camelCase in file names.**

## TypeScript style

- Prefer explicit types over `any`; never leave a parameter or return type as implicit `any`.
- Use DTOs (class-validator) for request bodies instead of untyped `@Body()` params.
- Co-locate module-specific types inside their module folder (e.g. `auth/types/`); only hoist to a shared location when more than one module consumes them.

## Scope of changes

- When asked to make changes, only modify files within the explicitly requested scope (e.g. "only the auth project").
- Do not touch other packages (`carval`, `di`, `event-emitter`, etc.) unless asked.
