import { GetRecordsPaginatedDto } from '@/common/dtos';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUsersPaginatedDto extends GetRecordsPaginatedDto {
  @ApiPropertyOptional({ type: 'array', description: 'List of roleId' })
  @IsOptional()
  @IsArray({ each: true })
  @IsNumber()
  roleIds: number[];
}
