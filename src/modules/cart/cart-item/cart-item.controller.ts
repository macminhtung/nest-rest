import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Req,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import type { TRequest } from '@/common/types';
import { CartItemService } from '@/modules/cart/cart-item/cart-item.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';
import { CreateCartItemDto, UpdateCartItemDto } from '@/modules/cart/cart-item/dtos';

@ApiBearerAuth()
@Controller(ETableName.CART_ITEM)
export class CartItemController {
  constructor(private readonly service: CartItemService) {}

  // #==========================#
  // # ==> CREATE CART-ITEM <== #
  // #==========================#
  @ApiOkResponse({ type: CartItemEntity })
  @Post()
  createCartItem(
    @Req() req: TRequest,
    @Body() payload: CreateCartItemDto,
  ): Promise<CartItemEntity> {
    return this.service.createCartItem(req.authUser.id, payload);
  }

  // #==========================#
  // # ==> UPDATE CART-ITEM <== #
  // #==========================#
  @ApiOkResponse({ type: CartItemEntity })
  @Put(':id')
  updateCartItem(
    @Req() req: TRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateCartItemDto,
  ): Promise<CartItemEntity> {
    return this.service.updateCartItem(req.authUser.id, { id, ...payload });
  }

  // #==========================#
  // # ==> DELETE CART-ITEM <== #
  // #==========================#
  @ApiOkResponse({ example: HttpStatus.OK, type: Number })
  @Delete(':id')
  deleteCartItem(
    @Req() req: TRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HttpStatus> {
    return this.service.deleteCartItem(req.authUser.id, id);
  }

  // #========================#
  // # ==> GET CART-ITEMS <== #
  // #========================#
  @ApiOkResponse({ type: [CartItemEntity] })
  @Get()
  getCartItems(@Req() req: TRequest): Promise<CartItemEntity[]> {
    return this.service.getCartItems(req.authUser.id);
  }
}
