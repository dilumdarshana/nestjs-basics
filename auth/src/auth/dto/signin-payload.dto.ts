import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SigninPayloadDto {
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
