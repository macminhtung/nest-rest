import { ApiProperty } from '@nestjs/swagger';

export class BaseDto {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
