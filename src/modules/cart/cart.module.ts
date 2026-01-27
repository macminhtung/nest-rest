import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '@/modules/product/product.module';
import { GatewayModule } from '@/modules/gateway/gateway.module';
import { BullMQModule } from '@/modules/bullmq/bullmq.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { CartItemController } from '@/modules/cart/cart-item/cart-item.controller';
import { CartItemService } from '@/modules/cart/cart-item/cart-item.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';
import { CheckoutCartService } from '@/modules/cart/checkout-cart/checkout-cart.service';
import { CheckoutCartEntity } from '@/modules/cart/checkout-cart/checkout-cart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItemEntity, CheckoutCartEntity]),
    ProductModule,
    GatewayModule,
    BullMQModule,
    PaymentModule,
  ],
  controllers: [CartItemController],
  providers: [CartItemService, CheckoutCartService],
  exports: [CartItemService, CheckoutCartService],
})
export class CartModule {}
