import { Controller, Post, Req, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { CartService } from '@/modules/cart/cart.service';
import { CartEntity } from '@/modules/cart/cart.entity';
import { CreateCartDto } from '@/modules/cart/dtos';
import type { TRequest } from '@/common/types';

@ApiBearerAuth()
@Controller(ETableName.CART)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // #=====================#
  // # ==> ADD TO CART <== #
  // #=====================#
  @ApiOkResponse({ type: CartEntity })
  @Post()
  addToCart(@Req() req: TRequest, @Body() payload: CreateCartDto): Promise<CartEntity> {
    return this.cartService.addToCart(req.authUser.id, payload);
  }
}
