import { GetPaginatedRecordsDto } from '@/common/dtos';
import { IsArray, IsNumber, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUsersPaginatedDto extends GetPaginatedRecordsDto {
  @ApiPropertyOptional({ type: 'array', description: 'List of roleId' })
  @IsOptional()
  @IsArray({ each: true })
  @IsNumber()
  roleIds: number[];

  @ApiPropertyOptional({ type: 'string', description: `User's email` })
  @IsOptional()
  @IsEmail()
  email: string;
}
