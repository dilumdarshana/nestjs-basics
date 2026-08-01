import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SignupPayloadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role_id: number;
}
