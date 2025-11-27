import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import { ETokenType } from '@/common/enums';
import { BaseService } from '@/common/base.service';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';

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
    }
  | {
      mode: EProcessUserTokenMode.DELETE_TOKEN_PAIR | EProcessUserTokenMode.REFRESH_ACCESS_TOKEN;
      refreshTokenId: string;
    }
) & {
  userId: string;
  newAccessToken: string;
  txRepository?: Repository<UserTokenEntity>; // Use for run with transaction
};

@Injectable()
export class UserTokenService extends BaseService<UserTokenEntity> {
  constructor(
    @InjectRepository(UserTokenEntity)
    public readonly repository: Repository<UserTokenEntity>,
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
    const { mode, txRepository, userId, newAccessToken } = payload;

    // Identify the repository
    const repository = txRepository || this.repository;

    if (
      mode === EProcessUserTokenMode.DELETE_TOKEN_PAIR ||
      mode === EProcessUserTokenMode.REFRESH_ACCESS_TOKEN
    ) {
      const { refreshTokenId } = payload;

      // Delete [OLD] accessToken
      if (mode === EProcessUserTokenMode.REFRESH_ACCESS_TOKEN) {
        await repository.delete(refreshTokenId);

        // Create [NEW] accessToken
        await repository.save({
          type: ETokenType.ACCESS_TOKEN,
          hashToken: this.generateHashToken(newAccessToken),
          refreshTokenId,
          userId,
        });
      }

      // Delete token pair (refresh & access token)
      else {
        await repository.delete([{ id: refreshTokenId }, { refreshTokenId }]);
      }
    }

    // Create [NEW] refreshToken
    else if (
      mode === EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR ||
      mode === EProcessUserTokenMode.CREATE_NEW_TOKEN_PAIR
    ) {
      // Clear all tokens belong to the userId
      if (mode === EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR) {
        await repository.delete({ userId });
      }

      // Create [NEW] refreshToken
      const { id: refreshTokenId } = await repository.save({
        type: ETokenType.REFRESH_TOKEN,
        hashToken: this.generateHashToken(payload.newRefreshToken),
        userId,
      });

      // Create [NEW] accessToken
      await repository.save({
        type: ETokenType.ACCESS_TOKEN,
        hashToken: this.generateHashToken(newAccessToken),
        refreshTokenId,
        userId,
      });
    }
  }
}
