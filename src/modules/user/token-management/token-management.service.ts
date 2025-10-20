import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BaseService } from '@/common/base.service';
import { TokenManagementEntity } from '@/modules/user/token-management/token-management.entity';

@Injectable()
export class TokenManagementService extends BaseService<TokenManagementEntity> {
  constructor(
    @InjectRepository(TokenManagementEntity)
    public readonly repository: EntityRepository<TokenManagementEntity>,
  ) {
    super(repository);
  }
}
