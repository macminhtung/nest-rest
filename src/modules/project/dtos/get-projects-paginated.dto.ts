import { GetPaginatedRecordsDto } from '@/common/dtos';
import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProjectsPaginatedDto extends GetPaginatedRecordsDto {
  @ApiPropertyOptional({ type: 'string', description: `UserId` })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'project name' })
  @IsOptional()
  @IsString()
  name?: string;
}
