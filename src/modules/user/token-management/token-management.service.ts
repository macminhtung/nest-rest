import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import crypto from 'crypto';
import { BaseService } from '@/common/base.service';

import { ETokenType } from '@/common/enums';
import { UserEntity } from '@/modules/user/user.entity';
import { TokenManagementEntity } from '@/modules/user/token-management/token-management.entity';

type TStoreNewTokenPair = {
  txRepository: EntityRepository<TokenManagementEntity>;
  userId: string;
  newRefreshToken: string;
  newAccessToken: string;
};

@Injectable()
export class TokenManagementService extends BaseService<TokenManagementEntity> {
  constructor(
    @InjectRepository(TokenManagementEntity)
    public readonly repository: EntityRepository<TokenManagementEntity>,
  ) {
    super(repository);
  }

  // #=============================#
  // # ==> GENERATE HASH TOKEN <== #
  // #=============================#
  generateHashToken(token: string) {
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashToken;
  }

  // #==============================#
  // # ==> STORE NEW TOKEN PAIR <== #
  // #==============================#
  async storeNewTokenPair(payload: TStoreNewTokenPair) {
    const { txRepository, userId, newRefreshToken, newAccessToken } = payload;
    // Store [NEW] hashRefreshToken
    const { id: refreshTokenId } = await this.create({
      entityData: {
        user: this.entityManager.getReference(UserEntity, userId),
        type: ETokenType.REFRESH_TOKEN,
        hashToken: this.generateHashToken(newRefreshToken),
      },
      txRepository,
    });

    // Store [NEW] hashAccessToken
    await this.create({
      entityData: {
        user: this.entityManager.getReference(UserEntity, userId),
        type: ETokenType.ACCESS_TOKEN,
        hashToken: this.generateHashToken(newAccessToken),
        refreshTokenId,
      },
      txRepository,
    });
  }
}
