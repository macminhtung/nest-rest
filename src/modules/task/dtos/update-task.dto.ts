import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ETaskStatus } from '@/common/enums';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

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
