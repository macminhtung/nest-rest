import { IsEmail, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiPropertyOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  location?: string;
}
