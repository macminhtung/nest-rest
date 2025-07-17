import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base.service';
import { UserEntity } from '@/modules/user/user.entity';

@Injectable()
export class AuthService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>
  ) {
    super(repository);
  }
}
