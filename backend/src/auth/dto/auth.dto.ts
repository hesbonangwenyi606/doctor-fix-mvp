import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(Role)
  role: Role; // CUSTOMER or TECHNICIAN at signup; ADMIN created by seed/other admin only in a real deployment
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
