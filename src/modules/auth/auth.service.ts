import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { ERROR_MESSAGES, DEFAULT_ROLES } from '@/common/constants';
import { ECookieKey, ETokenType } from '@/common/enums';
import type { TRequest } from '@/common/types';
import { BaseService } from '@/common/base.service';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import {
  UserTokenService,
  EProcessUserTokenMode,
} from '@/modules/user/user-token/user-token.service';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';
import { AuthCacheService } from '@/modules/redis-cache/auth-cache.service';
import { JwtService, TVerifyToken, AwsS3Service } from '@/modules/shared/services';
import {
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
  UpdatePasswordDto,
  UpdateProfileDto,
  GeneratePreSignedUrlDto,
} from '@/modules/auth/dtos';

@Injectable()
export class AuthService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,

    private userService: UserService,
    private userTokenCacheService: AuthCacheService,
    private userTokenService: UserTokenService,
    private jwtService: JwtService,
    private awsS3Service: AwsS3Service,
  ) {
    super(repository);
  }

  // #==================================#
  // # ==> VERIFY TOKEN AND CACHING <== #
  // #==================================#
  async verifyTokenAndCaching<T extends ETokenType>(
    payload: TVerifyToken<T> & { errorMessage?: string },
  ) {
    const { type, token, errorMessage } = payload;

    // Verify token
    const decodeToken = this.jwtService.verifyToken({ type, token });

    // Generate hashToken
    const hashToken = this.userTokenService.generateHashToken(token);

    // Get token cache data from redis
    const tokenCache = await this.userTokenCacheService.getTokenCache({
      userId: decodeToken.id,
      hashToken,
    });

    // CASE: Token cache data already exists ==> Return token cache data
    if (tokenCache) return tokenCache;

    // Check user already exists
    const existedUser = await this.userService.checkExist(
      {
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'roleId'],
        where: { id: decodeToken.id, userTokens: { type, hashToken } },
      },
      errorMessage,
    );

    // Set the token cache data to redis
    await this.userTokenCacheService.setTokenCache({ user: existedUser, type, hashToken });

    return existedUser;
  }

  // #=======================================#
  // # ==> SET REFRESH_TOKEN INTO COOKIE <== #
  // #=======================================#
  setRefreshTokenIntoCookie(res: Response, refreshToken: string) {
    const isProductionMode = process.env.NODE_ENV === 'prod';

    res.cookie(ECookieKey.REFRESH_TOKEN, refreshToken, {
      domain: isProductionMode ? process.env.DOMAIN : undefined,
      path: '/auth/',
      secure: isProductionMode,
      httpOnly: true,
      sameSite: isProductionMode ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  // #================#
  // # ==> SIGNUP <== #
  // #================#
  async signUp(payload: SignUpDto) {
    const { email, password, firstName, lastName } = payload;

    // Check if email has conflict
    await this.userService.checkConflict({ where: { email } });

    // Hash the password
    const hashPassword = await this.userService.generateHashPassword(password);

    // Create a new user
    const newUser = await this.repository.save({
      id: uuidv7(),
      email,
      password: hashPassword,
      firstName,
      lastName,
      roleId: DEFAULT_ROLES.USER.id,
    });

    return newUser;
  }

  // #================#
  // # ==> SIGNIN <== #
  // #================#
  async signIn(res: Response, payload: SignInDto) {
    const { email, password } = payload;

    // Check email already exists
    const existedUser = await this.userService.checkExist({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'roleId'],
    });
    const { id } = existedUser;

    // Check password is valid
    const isValidPassword = await this.userService.compareHashPassword({
      password,
      hashPassword: existedUser.password,
    });
    if (!isValidPassword)
      throw new BadRequestException({ message: ERROR_MESSAGES.PASSWORD_INCORRECT });

    // Generate new accessToken
    const commonTokenPayload = { id, email };
    const newAccessToken = this.jwtService.generateToken({
      tokenPayload: { ...commonTokenPayload, type: ETokenType.ACCESS_TOKEN },
      options: { expiresIn: 5 },
    });

    // Generate new refreshToken
    const newRefreshToken = this.jwtService.generateToken({
      tokenPayload: { ...commonTokenPayload, type: ETokenType.REFRESH_TOKEN },
    });

    // Store user tokens
    await this.userTokenService.processUserToken({
      mode: EProcessUserTokenMode.CREATE_NEW_TOKEN_PAIR,
      user: existedUser,
      newAccessToken,
      newRefreshToken,
    });

    // Set refreshToken into cookie
    this.setRefreshTokenIntoCookie(res, newRefreshToken);

    return { accessToken: newAccessToken };
  }

  // #=================#
  // # ==> SIGNOUT <== #
  // #=================#
  async signOut(req: TRequest, res: Response) {
    const { id: authId } = req.authUser;
    const refreshToken = req.cookies[ECookieKey.REFRESH_TOKEN]!;

    // Check the refreshToken already exist
    const { id: refreshTokenId } = await this.userTokenService.checkExist({
      where: {
        userId: authId,
        type: ETokenType.REFRESH_TOKEN,
        hashToken: this.userTokenService.generateHashToken(refreshToken),
      },
    });

    //  Process user tokens
    await this.userTokenService.processUserToken({
      mode: EProcessUserTokenMode.DELETE_TOKEN_PAIR,
      userId: authId,
      refreshTokenId,
    });

    // Clear refreshToken into cookie
    this.setRefreshTokenIntoCookie(res, '');

    return HttpStatus.OK;
  }

  // #==============================#
  // # ==> REFRESH ACCESS TOKEN <== #
  // #==============================#
  async refreshAccessToken(req: TRequest, payload: RefreshTokenDto) {
    const refreshToken = req.cookies[ECookieKey.REFRESH_TOKEN]!;
    const { accessToken } = payload;

    // [JWT] Verify refreshToken
    const decodeToken = this.jwtService.verifyToken({
      type: ETokenType.REFRESH_TOKEN,
      token: refreshToken,
    });
    const { id: userId, email } = decodeToken;

    // [JWT] Verify accessToken has expired
    try {
      // ==> Should be throw jwt expired error
      this.jwtService.verifyToken({ type: ETokenType.ACCESS_TOKEN, token: accessToken });

      // ==> Not throw jwt expired ==> This means the token is still alive
      return { accessToken: accessToken };
    } catch (error) {
      if (error.message !== 'jwt expired')
        throw new BadRequestException({ message: ERROR_MESSAGES.ACCESS_TOKEN_INVALID });
    }

    // [DATABASE] Check the refreshToken already exists
    const hashRefreshToken = this.userTokenService.generateHashToken(refreshToken);
    const { id: refreshTokenId } = await this.userTokenService.checkExist(
      { where: { userId, type: ETokenType.REFRESH_TOKEN, hashToken: hashRefreshToken } },
      ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
    );

    // [DATABASE] Check the accessToken already exists
    const hashAccessToken = this.userTokenService.generateHashToken(accessToken);
    await this.userTokenService.checkExist(
      {
        where: {
          userId,
          type: ETokenType.ACCESS_TOKEN,
          hashToken: hashAccessToken,
          refreshTokenId,
        },
      },
      ERROR_MESSAGES.ACCESS_TOKEN_INVALID,
    );

    // Generate new accessToken
    const newAccessToken = this.jwtService.generateToken({
      tokenPayload: { id: userId, email, type: ETokenType.ACCESS_TOKEN },
    });

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await this.handleTransactionAndRelease({
      queryRunner,
      processFunc: async () => {
        // Store new accessToken
        await this.userTokenService.processUserToken({
          mode: EProcessUserTokenMode.REFRESH_ACCESS_TOKEN,
          txRepository: queryRunner.manager.getRepository(UserTokenEntity),
          userId,
          refreshTokenId,
          newAccessToken,
          oldHashAccessToken: hashAccessToken,
        });
      },
    });

    return { accessToken: newAccessToken };
  }

  // #=========================#
  // # ==> UPDATE PASSWORD <== #
  // #=========================#
  async updatePassword(req: TRequest, res: Response, payload: UpdatePasswordDto) {
    const { id: authId, email, password } = req.authUser;
    const { oldPassword, newPassword } = payload;

    // Compare hashPassword with oldPassword
    const isCorrectPassword = await this.userService.compareHashPassword({
      password: oldPassword,
      hashPassword: password,
    });
    if (!isCorrectPassword)
      throw new BadRequestException({ message: ERROR_MESSAGES.PASSWORD_INCORRECT });

    // Prevent reused the password
    const isReusedPassword = await this.userService.compareHashPassword({
      password: newPassword,
      hashPassword: password,
    });
    if (isReusedPassword)
      throw new BadRequestException({ message: ERROR_MESSAGES.PASSWORD_REUSED });

    // Generate newHashPassword
    const newHashPassword = await this.userService.generateHashPassword(newPassword);

    // Generate accessToken
    const commonTokenPayload = { id: authId, email };
    const newAccessToken = this.jwtService.generateToken({
      tokenPayload: { ...commonTokenPayload, type: ETokenType.ACCESS_TOKEN },
    });

    // Generate refreshToken
    const newRefreshToken = this.jwtService.generateToken({
      tokenPayload: { ...commonTokenPayload, type: ETokenType.REFRESH_TOKEN },
    });

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await this.handleTransactionAndRelease({
      queryRunner,
      processFunc: async () => {
        // Update new password
        await queryRunner.manager.update(UserEntity, authId, {
          password: newHashPassword,
        });

        //  Process user tokens
        await this.userTokenService.processUserToken({
          mode: EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR,
          txRepository: queryRunner.manager.getRepository(UserTokenEntity),
          user: { ...req.authUser, password: newHashPassword },
          newRefreshToken,
          newAccessToken,
        });
      },
    });

    // Set refreshToken into cookie
    this.setRefreshTokenIntoCookie(res, newRefreshToken);

    return { accessToken: newAccessToken };
  }

  // #=====================#
  // # ==> GET PROFILE <== #
  // #=====================#
  getProfile(req: TRequest) {
    return { ...req.authUser, password: undefined };
  }

  // #========================#
  // # ==> UPDATE PROFILE <== #
  // #========================#
  async updateProfile(req: TRequest, payload: UpdateProfileDto) {
    await this.repository.update(req.authUser.id, payload);
    return payload;
  }

  // # =============================== #
  // # ==> GENERATE PRE-SIGNED URL <== #
  // # =============================== #
  async generatePreSignedUrl(req: TRequest, payload: GeneratePreSignedUrlDto) {
    const { id: authId } = req.authUser;
    const { filename, contentType } = payload;

    return await this.awsS3Service.generatePreSignedUrl({
      key: `${authId}/${filename}`,
      contentType,
    });
  }
}
