import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCardDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  paymentMethodId: string;
}
