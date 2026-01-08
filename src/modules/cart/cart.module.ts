import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '@/modules/product/product.module';
import { CartController } from '@/modules/cart/cart.controller';
import { CartService } from '@/modules/cart/cart.service';
import { CartEntity } from '@/modules/cart/cart.entity';
import { CartItemService } from '@/modules/cart/cart-item/cart-item.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity]), ProductModule],
  controllers: [CartController],
  providers: [CartService, CartItemService],
  exports: [CartService, CartItemService],
})
export class CartModule {}
