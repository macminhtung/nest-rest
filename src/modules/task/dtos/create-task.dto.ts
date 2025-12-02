import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';
import { ETaskStatus } from '@/common/enums';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty()
  @IsEnum(ETaskStatus)
  status: ETaskStatus;

  @ApiProperty()
  @IsUUID(7)
  userId: string;

  @ApiProperty()
  @IsUUID(7)
  projectId: string;
}
