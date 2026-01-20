import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { BaseService } from '@/common/base.service';
import { ESocketEventName } from '@/common/enums';
import { CartEntity, ECartStatus } from '@/modules/cart/cart.entity';
import { CartItemService } from '@/modules/cart/cart-item/cart-item.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';
import { ProductService } from '@/modules/product/product.service';
import { SocketGateway } from '@/modules/gateway/socket.gateway';
import { CreateCartDto } from '@/modules/cart/dtos';

@Injectable()
export class CartService extends BaseService<CartEntity> {
  constructor(
    @InjectRepository(CartEntity)
    public readonly repository: Repository<CartEntity>,

    private readonly productService: ProductService,
    private readonly cartItemService: CartItemService,
    private readonly socketGateway: SocketGateway,
  ) {
    super(repository);
  }

  // #=====================#
  // # ==> ADD TO CART <== #
  // #=====================#
  async addToCart(userId: string, payload: CreateCartDto) {
    const { cartItems } = payload;

    // Validate cart items and products in parallel
    await Promise.all(
      cartItems.flatMap(({ productId, id }) => [
        id ? this.cartItemService.checkExist({ where: { id } }) : Promise.resolve(),
        this.productService.checkExist({ where: { id: productId } }),
      ]),
    );

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    const cartInfo = await this.handleTransactionAndRelease(
      queryRunner,

      // Process function
      async () => {
        // Find existed active cart
        let existedCart = await queryRunner.manager.findOne(CartEntity, {
          where: { userId, status: ECartStatus.ACTIVE },
          relations: ['cartItems'],
          lock: { mode: 'pessimistic_write' }, // Lock the record for preventing race condition
        });

        // CASE: Have no active cart ==> Create new one
        if (!existedCart) {
          existedCart = await queryRunner.manager.save(CartEntity, {
            id: uuidv7(),
            status: ECartStatus.ACTIVE,
            userId,
          });
        }

        // CASE: Cart is existed ==> Delete cart items
        else {
          const existedCartItemIds = existedCart.cartItems.map((item) => item.id);
          const payloadCartItemIds = cartItems.map((item) => item.id).filter((id) => id);

          // Find cart items to delete
          const cartItemIdsToDelete = existedCartItemIds.filter(
            (id) => !payloadCartItemIds.includes(id),
          );

          // Delete cart items
          if (cartItemIdsToDelete.length)
            await queryRunner.manager.delete(CartItemEntity, { id: In(cartItemIdsToDelete) });
        }

        // Merge cart items
        const mergeCartItems = await queryRunner.manager.save(
          CartItemEntity,
          cartItems.map(({ id, productId, quantity }) => ({
            id: id || uuidv7(),
            productId,
            quantity,
            cartId: existedCart?.id,
            userId,
          })),
        );

        // Load cart items with product info
        const cartItemIds = mergeCartItems.map((item) => item.id);
        const newCartItems = await queryRunner.manager.find(CartItemEntity, {
          where: { id: In(cartItemIds) },
          relations: ['product'],
        });

        return { ...existedCart, cartItems: newCartItems };
      },
    );

    // Emit cartInfo to personal room
    this.socketGateway.wss.to(userId).emit(ESocketEventName.CART_UPDATED, cartInfo);

    return cartInfo;
  }
}
