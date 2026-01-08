import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubCartItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(1000)
  quantity: number;
}

export class CreateCartDto {
  @ApiProperty({ type: [SubCartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubCartItemDto)
  cartItems: SubCartItemDto[];
}
