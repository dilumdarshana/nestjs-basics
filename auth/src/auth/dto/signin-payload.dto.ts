import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SigninPayloadDto {
  @IsEmail()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
