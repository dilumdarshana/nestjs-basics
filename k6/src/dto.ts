// Request-body DTO for POST /signin. NOTE: unlike other projects there is NO
// ValidationPipe here — the fields are plain strings with no class-validator
// decorators, so any body shape is accepted. `!` (definite assignment) tells
// TS these are populated at runtime (here by Nest's body parsing), satisfying
// the strict-property-init rule (TS 6).
export class SigninDto {
  username!: string;
  password!: string;
}
