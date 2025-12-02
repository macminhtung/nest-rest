import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddUserToProjectDto {
  @ApiProperty()
  @IsUUID()
  userId: string;
}
