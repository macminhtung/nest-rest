import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description: string;
}
