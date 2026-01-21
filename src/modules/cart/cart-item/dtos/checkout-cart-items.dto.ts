import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CheckoutCartItemsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('7', { each: true })
  cartItemIds: string[];
}
