import { IsEmail, IsNumber, IsString } from 'class-validator';

// Request body DTO validated by the global ValidationPipe (main.ts) and
// transformed from plain JSON into this class. `!` marks the fields as
// definitely-assigned because class-transformer populates them at runtime,
// not in a constructor.
export class PostHelloDto {
  @IsString()
  name!: string;

  @IsNumber()
  age!: number;

  @IsEmail()
  email!: string;
}
