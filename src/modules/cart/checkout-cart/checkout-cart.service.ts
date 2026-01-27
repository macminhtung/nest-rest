import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { BaseService } from '@/common/base.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';
import {
  CheckoutCartEntity,
  ECheckoutCartStatus,
  TCheckoutProduct,
} from '@/modules/cart/checkout-cart/checkout-cart.entity';
import { CheckoutCartItemsDto } from '@/modules/cart/checkout-cart/dtos';
import { UserEntity } from '@/modules/user/user.entity';
import Stripe from 'stripe';

@Injectable()
export class CheckoutCartService extends BaseService<CheckoutCartEntity> {
  constructor(
    @InjectRepository(CheckoutCartEntity)
    public readonly repository: Repository<CheckoutCartEntity>,

    private readonly paymentService: PaymentService,
  ) {
    super(repository);
  }

  // #=============================#
  // # ==> CHECKOUT CART-ITEMS <== #
  // #=============================#
  async checkoutCartItems(user: UserEntity, payload: CheckoutCartItemsDto) {
    const { paymentMethodId, cartItemIds } = payload;
    let cancelPaymentIntentFunc: () => Promise<Stripe.Response<Stripe.PaymentIntent>>;

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await this.handleTransactionAndRelease({
      queryRunner,
      processFunc: async () => {
        // Find cartItems based on cartItemIds
        const cartItems = await queryRunner.manager.find(CartItemEntity, {
          where: { userId: user.id, id: In(cartItemIds) },
          relations: { product: true },
          lock: { mode: 'for_no_key_update' },
        });

        // Check the cartItemIds is valid
        if (cartItems.length !== cartItemIds.length)
          throw new BadRequestException({ message: 'CartItemIds is invalid' });

        // Delete cartItems
        await queryRunner.manager.delete(CartItemEntity, cartItems);

        // Create new paymentIntent
        const { paymentIntentId, status, client_secret, totalPrice, cancelPaymentIntent } =
          await this.paymentService.createPaymentIntent({
            user,
            cartItems,
            paymentMethodId,
          });
        const is3DSCard = status === 'requires_action';

        // Update cancelPaymentIntentFunc for callback
        cancelPaymentIntentFunc = cancelPaymentIntent;

        // Identify the checkoutProducts
        const checkoutProducts: TCheckoutProduct[] = cartItems.map(({ product, quantity }) => {
          const { id, name, description, image, unitPrice } = product;
          return { id, image, quantity, name, description, unitPrice };
        });

        // Create a new checkoutCart
        const newCheckoutCart = await queryRunner.manager.save(CheckoutCartEntity, {
          id: uuidv7(),
          totalPrice,
          products: checkoutProducts,
          status: is3DSCard ? ECheckoutCartStatus.WAITING_3DS : ECheckoutCartStatus.PAID,
          userId: user.id,
          paymentIntentId,
          clientSecret: is3DSCard ? client_secret! : undefined,
        });

        return newCheckoutCart;
      },

      rollbackFunc: () => cancelPaymentIntentFunc(),
    });

    return HttpStatus.OK;
  }
}
