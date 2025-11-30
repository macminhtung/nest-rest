import { GetPaginatedRecordsDto } from '@/common/dtos';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ETaskStatus } from '@/common/enums';

export class GetTasksPaginatedDto extends GetPaginatedRecordsDto {
  @IsOptional()
  @IsEnum(ETaskStatus)
  status?: ETaskStatus;

  @IsOptional()
  @IsUUID(7)
  userId?: string;

  @IsOptional()
  @IsUUID(7)
  projectId?: string;
}
