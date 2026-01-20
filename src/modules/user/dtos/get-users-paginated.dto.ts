import { GetPaginatedRecordsDto } from '@/common/dtos';
import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { DEFAULT_ROLES } from '@/common/constants';

export class GetUsersPaginatedDto extends GetPaginatedRecordsDto {
  @ApiPropertyOptional({ type: 'array', description: 'List of roleId' })
  @IsOptional()
  @Transform(({ value }) => (value ? (Array.isArray(value) ? value : [value]) : undefined))
  @IsIn([DEFAULT_ROLES.ADMIN.id, DEFAULT_ROLES.USER.id], { each: true })
  roleIds?: number[];

  @ApiPropertyOptional({ type: 'string', description: `User's email` })
  @IsOptional()
  @IsEmail()
  email?: string;
}
