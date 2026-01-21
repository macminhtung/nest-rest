import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base.service';
import { PaidCartEntity } from '@/modules/cart/paid-cart/paid-cart.entity';

@Injectable()
export class PaidCartService extends BaseService<PaidCartEntity> {
  constructor(
    @InjectRepository(PaidCartEntity)
    public readonly repository: Repository<PaidCartEntity>,
  ) {
    super(repository);
  }
}
