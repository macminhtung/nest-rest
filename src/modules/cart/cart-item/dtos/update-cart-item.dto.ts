import { OmitType } from '@nestjs/swagger';
import { CreateCartItemDto } from '@/modules/cart/cart-item/dtos/create-cart-item.dto';

export class UpdateCartItemDto extends OmitType(CreateCartItemDto, ['productId']) {}
