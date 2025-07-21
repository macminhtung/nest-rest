import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base.service';
import { RoleEntity } from '@/modules/user/role/role.entity';

@Injectable()
export class RoleService extends BaseService<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    public readonly repository: Repository<RoleEntity>,
  ) {
    super(repository);
  }
}
