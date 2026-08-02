import { IsString, MinLength } from 'class-validator';

// Request-body DTO for POST /messages. The global ValidationPipe in main.ts
// validates the raw body against these decorators BEFORE the handler runs;
// a non-string or empty content is rejected with 400. `!` (definite
// assignment) tells TS this is set by class-validator at runtime, so the
// strict-property-init rule (TS 6) doesn't flag it.
export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;
}
