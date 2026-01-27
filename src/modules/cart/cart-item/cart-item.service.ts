import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { BaseService } from '@/common/base.service';
import { ProductService } from '@/modules/product/product.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';
import { CreateCartItemDto, UpdateCartItemDto } from '@/modules/cart/cart-item/dtos';

@Injectable()
export class CartItemService extends BaseService<CartItemEntity> {
  constructor(
    @InjectRepository(CartItemEntity)
    public readonly repository: Repository<CartItemEntity>,

    private readonly productService: ProductService,
  ) {
    super(repository);
  }

  // #==========================#
  // # ==> CREATE CART ITEM <== #
  // #==========================#
  async createCartItem(userId: string, payload: CreateCartItemDto) {
    const { productId, quantity } = payload;

    // Prevent duplicate cart item
    await this.checkConflict({ where: { userId, productId } });

    // Check to ensure the product exists
    await this.productService.checkExist({ where: { id: productId } });

    // Create a new cart-item
    const newCartItem = await this.repository.save({
      id: uuidv7(),
      userId,
      productId,
      quantity,
    });

    return newCartItem;
  }

  // #==========================#
  // # ==> UPDATE CART ITEM <== #
  // #==========================#
  async updateCartItem(userId: string, payload: UpdateCartItemDto & { id: string }) {
    const { id, quantity } = payload;

    // Check to ensure the cart-item exists
    const existedCartItem = await this.checkExist({ where: { id, userId } });

    // Update the cart-item
    await this.repository.update(id, { quantity });

    return { ...existedCartItem, quantity };
  }

  // #==========================#
  // # ==> DELETE CART ITEM <== #
  // #==========================#
  async deleteCartItem(userId: string, id: string) {
    // Check to ensure the cart-item exists
    await this.checkExist({ where: { id, userId } });

    // Delete the cart-item
    await this.repository.delete(id);

    return HttpStatus.OK;
  }

  // #========================#
  // # ==> GET CART ITEMS <== #
  // #========================#
  async getCartItems(userId: string) {
    // Get cartItems
    const cartItems = await this.repository.find({
      where: { userId },
      relations: { product: true },
    });

    return cartItems;
  }
}
