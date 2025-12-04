import { IsString, IsIn, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_ROLES } from '@/common/constants';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional()
  @IsIn([DEFAULT_ROLES.ADMIN.id, DEFAULT_ROLES.STAFF.id, DEFAULT_ROLES.USER.id])
  roleId?: number;
}
