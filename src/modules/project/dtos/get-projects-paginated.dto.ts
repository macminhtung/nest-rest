import { GetPaginatedRecordsDto } from '@/common/dtos';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProjectsPaginatedDto extends GetPaginatedRecordsDto {
  @ApiPropertyOptional({ type: 'string', description: `UserId` })
  @IsOptional()
  @IsUUID(7)
  userId: string;
}
