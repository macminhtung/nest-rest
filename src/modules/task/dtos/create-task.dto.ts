import { IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';
import { ETaskStatus } from '@/common/enums';

export class CreateTaskDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsEnum(ETaskStatus)
  status: ETaskStatus;

  @IsUUID(7)
  userId: string;

  @IsUUID(7)
  projectId: string;
}
