import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class RegisterDto extends CreateUserDto {
  @IsString()
  declare referralCode: string; // Required for registration
}
