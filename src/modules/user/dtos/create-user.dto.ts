import { IsEmail, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_ROLES } from '@/common/constants';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty()
  @IsIn([DEFAULT_ROLES.ADMIN.id, DEFAULT_ROLES.STAFF.id, DEFAULT_ROLES.USER.id])
  roleId: number;
}
