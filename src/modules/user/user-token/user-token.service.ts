import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { ETokenType } from '@/common/enums';
import { BaseService } from '@/common/base.service';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';
import { RedisCacheService } from '@/modules/redis-cache/redis-cache.service';

export enum EProcessUserTokenMode {
  RESET_AND_CREATE_NEW_TOKEN_PAIR = 'RESET_AND_CREATE_NEW_TOKEN_PAIR',
  CREATE_NEW_TOKEN_PAIR = 'CREATE_NEW_TOKEN_PAIR',
  DELETE_TOKEN_PAIR = 'DELETE_TOKEN_PAIR',
  REFRESH_ACCESS_TOKEN = 'REFRESH_ACCESS_TOKEN',
}

type TStoreNewTokenPair = (
  | {
      mode:
        | EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR
        | EProcessUserTokenMode.CREATE_NEW_TOKEN_PAIR;
      newRefreshToken: string;
      newAccessToken: string;
    }
  | {
      mode: EProcessUserTokenMode.DELETE_TOKEN_PAIR;
      refreshTokenId: string;
    }
  | {
      mode: EProcessUserTokenMode.REFRESH_ACCESS_TOKEN;
      refreshTokenId: string;
      newAccessToken: string;
    }
) & {
  userId: string;
  txRepository?: Repository<UserTokenEntity>; // Use for run with transaction
};

@Injectable()
export class UserTokenService extends BaseService<UserTokenEntity> {
  constructor(
    @InjectRepository(UserTokenEntity)
    public readonly repository: Repository<UserTokenEntity>,

    private redisCacheService: RedisCacheService,
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

  // #============================#
  // # ==> PROCESS USER TOKEN <== #
  // #============================#
  async processUserToken(payload: TStoreNewTokenPair) {
    const { mode, txRepository, userId } = payload;

    // Identify the repository
    const repository = txRepository || this.repository;

    // Initialize hashTokens for deletion
    const delHashTokens: string[] = [];
    let isDeleteUserCache = false;

    // CASE: ==> DELETE_TOKEN_PAIR | REFRESH_ACCESS_TOKEN <==
    if (
      mode === EProcessUserTokenMode.DELETE_TOKEN_PAIR ||
      mode === EProcessUserTokenMode.REFRESH_ACCESS_TOKEN
    ) {
      const { refreshTokenId } = payload;

      // Delete [OLD] accessToken
      if (mode === EProcessUserTokenMode.REFRESH_ACCESS_TOKEN) {
        await repository.delete({ refreshTokenId });

        // Create [NEW] accessToken
        await repository.save({
          id: uuidv7(),
          type: ETokenType.ACCESS_TOKEN,
          hashToken: this.generateHashToken(payload.newAccessToken),
          refreshTokenId,
          userId,
        });
      }

      // Delete token pair (refresh & access token)
      else {
        const tokens = await this.repository.findBy([{ id: refreshTokenId }, { refreshTokenId }]);
        await repository.delete(tokens.map((i) => i.id));

        // Add delete cache keys
        tokens.forEach(({ hashToken }) => delHashTokens.push(hashToken));
      }
    }

    // CASE: ==> RESET_AND_CREATE_NEW_TOKEN_PAIR | CREATE_NEW_TOKEN_PAIR <==
    else if (
      mode === EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR ||
      mode === EProcessUserTokenMode.CREATE_NEW_TOKEN_PAIR
    ) {
      const { newRefreshToken, newAccessToken } = payload;

      // Clear all tokens belong to the userId
      if (mode === EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR) {
        const allTokens = await this.repository.findBy({ userId });
        await repository.delete(allTokens.map((i) => i.id));

        // Add delete cache keys
        allTokens.forEach(({ hashToken }) => delHashTokens.push(hashToken));
        isDeleteUserCache = true;
      }

      // Create [NEW] refreshToken
      const refreshTokenId = uuidv7();
      await repository.save({
        id: refreshTokenId,
        type: ETokenType.REFRESH_TOKEN,
        hashToken: this.generateHashToken(newRefreshToken),
        userId,
      });

      // Create [NEW] accessToken
      await repository.save({
        id: uuidv7(),
        type: ETokenType.ACCESS_TOKEN,
        hashToken: this.generateHashToken(newAccessToken),
        refreshTokenId,
        userId,
      });
    }

    // Delete authCache
    if (delHashTokens.length)
      await this.redisCacheService.deleteAuthCache({
        userId,
        hashTokens: delHashTokens,
        isDeleteUserCache,
      });
  }
}
