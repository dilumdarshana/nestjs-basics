import { IsEmail, IsString } from 'class-validator';

export class CrateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
