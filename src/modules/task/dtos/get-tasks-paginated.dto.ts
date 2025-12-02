import { GetPaginatedRecordsDto } from '@/common/dtos';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ETaskStatus } from '@/common/enums';

export class GetTasksPaginatedDto extends GetPaginatedRecordsDto {
  @IsOptional()
  @IsEnum(ETaskStatus)
  status?: ETaskStatus;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}
