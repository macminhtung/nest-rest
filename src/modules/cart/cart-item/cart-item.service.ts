import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base.service';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';

@Injectable()
export class CartItemService extends BaseService<CartItemEntity> {
  constructor(
    @InjectRepository(CartItemEntity)
    public readonly repository: Repository<CartItemEntity>,
  ) {
    super(repository);
  }
}
