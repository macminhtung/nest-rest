import { ApiProperty } from '@nestjs/swagger';

export class CardInfoDto {
  @ApiProperty({ description: 'Payment method ID' })
  id: string;

  @ApiProperty({ description: 'Last 4 digits of the card' })
  last4: string;

  @ApiProperty({ description: 'Card brand (e.g., Visa, Mastercard)' })
  brand: string;

  @ApiProperty({ description: 'Expiration month' })
  expMonth: string;

  @ApiProperty({ description: 'Expiration year' })
  expYear: string;
}
