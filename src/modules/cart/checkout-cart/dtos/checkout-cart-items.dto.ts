import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CheckoutCartItemsDto {
  @ApiProperty()
  @IsString()
  paymentMethodId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('7', { each: true })
  cartItemIds: string[];
}
