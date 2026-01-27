import { Controller, Post, Req, Body, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import type { TRequest } from '@/common/types';
import { ETableName } from '@/common/enums';
import { CheckoutCartService } from '@/modules/cart/checkout-cart/checkout-cart.service';
import { CheckoutCartItemsDto } from '@/modules/cart/checkout-cart/dtos';

@ApiBearerAuth()
@Controller(ETableName.CHECKOUT_CART)
export class CheckoutController {
  constructor(private readonly service: CheckoutCartService) {}

  // #=======================#
  // # ==> CHECKOUT CART <== #
  // #=======================#
  @ApiOkResponse({ example: HttpStatus.OK, type: Number })
  @Post()
  checkoutCartItems(
    @Req() req: TRequest,
    @Body() payload: CheckoutCartItemsDto,
  ): Promise<HttpStatus> {
    return this.service.checkoutCartItems(req.authUser, payload);
  }
}
