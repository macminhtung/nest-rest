import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '@/modules/product/product.module';
import { GatewayModule } from '@/modules/gateway/gateway.module';
import { CartItemController } from '@/modules/cart/cart-item/cart-item.controller';
import { CartItemService } from '@/modules/cart/cart-item/cart-item.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';
import { PaidCartService } from '@/modules/cart/paid-cart/paid-cart.service';
import { PaidCartEntity } from '@/modules/cart/paid-cart/paid-cart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItemEntity, PaidCartEntity]),
    ProductModule,
    GatewayModule,
  ],
  controllers: [CartItemController],
  providers: [CartItemService, PaidCartService],
  exports: [CartItemService, PaidCartService],
})
export class CartModule {}
