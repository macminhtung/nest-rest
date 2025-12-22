import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { ETokenType, ETableName } from '@/common/enums';
import { BaseService } from '@/common/base.service';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';
import { RedisCacheService } from '@/modules/redis-cache/redis-cache.service';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';

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
      user: UserEntity;
    }
  | {
      mode: EProcessUserTokenMode.DELETE_TOKEN_PAIR;
      refreshTokenId: string;
      userId: string;
    }
  | {
      mode: EProcessUserTokenMode.REFRESH_ACCESS_TOKEN;
      refreshTokenId: string;
      newAccessToken: string;
      userId: string;
    }
) & {
  txRepository?: Repository<UserTokenEntity>; // Use for run with transaction
};

@Injectable()
export class UserTokenService extends BaseService<UserTokenEntity> {
  constructor(
    @InjectRepository(UserTokenEntity)
    public readonly repository: Repository<UserTokenEntity>,

    private userService: UserService,
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
    const { mode, txRepository } = payload;

    // Identify the repository
    const repository = txRepository || this.repository;

    // CASE: ==> DELETE_TOKEN_PAIR | REFRESH_ACCESS_TOKEN <==
    if (
      mode === EProcessUserTokenMode.DELETE_TOKEN_PAIR ||
      mode === EProcessUserTokenMode.REFRESH_ACCESS_TOKEN
    ) {
      const { refreshTokenId, userId } = payload;

      // CASE: REFRESH_ACCESS_TOKEN ==> Delete [OLD] accessToken + Set new accessToken cache
      if (mode === EProcessUserTokenMode.REFRESH_ACCESS_TOKEN) {
        const { newAccessToken } = payload;

        // Delete [OLD] accessToken
        await repository.delete({ refreshTokenId });

        // Create [NEW] accessToken
        await repository.save({
          id: uuidv7(),
          type: ETokenType.ACCESS_TOKEN,
          hashToken: this.generateHashToken(payload.newAccessToken),
          refreshTokenId,
          userId,
        });

        // Identify the existedUser
        const existedUser =
          (await this.redisCacheService.get<UserEntity>(`${ETableName.USERS}/${userId}`)) ||
          (await this.userService.checkExist({
            where: { id: userId },
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'roleId'],
          }));

        // Set new accessToken cache
        this.redisCacheService.setAuthCache({
          user: existedUser,
          type: ETokenType.ACCESS_TOKEN,
          hashToken: this.generateHashToken(newAccessToken),
        });
      }

      // Delete token pair (refresh & access token)
      else {
        const tokens = await this.repository.findBy([{ id: refreshTokenId }, { refreshTokenId }]);
        await repository.delete(tokens.map((i) => i.id));

        // Delete token caches
        const delHashTokens = tokens.map(({ hashToken }) => hashToken);
        await this.redisCacheService.deleteAuthCache({ userId, hashTokens: delHashTokens });
      }
    }

    // CASE: ==> RESET_AND_CREATE_NEW_TOKEN_PAIR | CREATE_NEW_TOKEN_PAIR <==
    else if (
      mode === EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR ||
      mode === EProcessUserTokenMode.CREATE_NEW_TOKEN_PAIR
    ) {
      const { newRefreshToken, newAccessToken, user } = payload;
      const { id: userId } = user;

      // Clear all tokens belong to the userId
      if (mode === EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR) {
        const allTokens = await this.repository.findBy({ userId });
        await repository.delete(allTokens.map((i) => i.id));

        // Delete all token caches
        const delHashTokens = allTokens.map(({ hashToken }) => hashToken);
        await this.redisCacheService.deleteAuthCache({ userId, hashTokens: delHashTokens });
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

      // Set the accessToken & refreshToken cache to redis
      await Promise.all([
        this.redisCacheService.setAuthCache({
          user,
          type: ETokenType.REFRESH_TOKEN,
          hashToken: this.generateHashToken(newRefreshToken),
        }),
        this.redisCacheService.setAuthCache({
          user,
          type: ETokenType.ACCESS_TOKEN,
          hashToken: this.generateHashToken(newAccessToken),
        }),
      ]);
    }
  }
}
