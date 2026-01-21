import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsUUID } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty()
  @IsUUID('7')
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(1000)
  quantity: number;
}
