import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { ERROR_MESSAGES, DEFAULT_ROLES } from '@/common/constants';
import { ECookieKey, ETokenType, ETableName } from '@/common/enums';
import type { TRequest } from '@/common/types';
import { BaseService } from '@/common/base.service';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import {
  UserTokenService,
  EProcessUserTokenMode,
} from '@/modules/user/user-token/user-token.service';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';
import { RedisCacheService } from '@/modules/redis-cache/redis-cache.service';
import {
  JwtService,
  TVerifyToken,
  AwsS3Service,
  ACCESS_TOKEN_EXPIRES_IN,
} from '@/modules/shared/services';
import {
  SignUpDto,
  SignInDto,
  SignInResponseDto,
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
    private redisCacheService: RedisCacheService,
    private userTokenService: UserTokenService,
    private jwtService: JwtService,
    private awsS3Service: AwsS3Service,
  ) {
    super(repository);
  }

  // #=====================#
  // # ==> CHECK TOKEN <== #
  // #=====================#
  async checkToken<T extends ETokenType>(
    payload: TVerifyToken<T> & { errorMessage?: string },
  ): Promise<UserEntity> {
    const { type, token, errorMessage } = payload;

    // Verify token
    const decodeToken = this.jwtService.verifyToken({ type, token });

    // Generate hashToken
    const hashToken = this.userTokenService.generateHashToken(token);

    // Get auth cache data from redis
    const authCache = await this.redisCacheService.getAuthCache({
      userId: decodeToken.id,
      hashToken,
    });

    // CASE: Auth cache data already exists ==> Return cache data
    if (authCache) return authCache;

    // Check user already exists
    const existedUser = await this.userService.checkExist(
      {
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'roleId', 'role'],
        where: { id: decodeToken.id, userTokens: { type, hashToken } },
        relations: { role: true },
      },
      errorMessage,
    );

    // Set the auth cache data to redis
    await this.redisCacheService.setAuthCache({ user: existedUser, type, hashToken });

    return existedUser;
  }

  // #=======================================#
  // # ==> SET REFRESH_TOKEN INTO COOKIE <== #
  // #=======================================#
  setRefreshTokenIntoCookie(res: Response, refreshToken: string) {
    const isProductionMode = process.env.NODE_ENV === 'prod';

    res.cookie(ECookieKey.REFRESH_TOKEN, refreshToken, {
      domain: isProductionMode ? process.env.DOMAIN : undefined,
      path: '/auth/refresh-token',
      secure: isProductionMode,
      httpOnly: true,
      sameSite: isProductionMode ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  // #================#
  // # ==> SIGNUP <== #
  // #================#
  async signUp(payload: SignUpDto): Promise<UserEntity> {
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
  async signIn(res: Response, payload: SignInDto): Promise<SignInResponseDto> {
    const { email, password } = payload;

    // Check email already exists
    const existUser = await this.userService.checkExist({
      where: { email },
      select: ['id', 'password'],
    });
    const { id } = existUser;

    // Check password is valid
    const isValidPassword = await this.userService.compareHashPassword({
      password,
      hashPassword: existUser.password,
    });
    if (!isValidPassword)
      throw new BadRequestException({ message: ERROR_MESSAGES.PASSWORD_INCORRECT });

    // Generate new accessToken
    const commonTokenPayload = { id, email };
    const newAccessToken = this.jwtService.generateToken({
      tokenPayload: { ...commonTokenPayload, type: ETokenType.ACCESS_TOKEN },
    });

    // Generate new refreshToken
    const newRefreshToken = this.jwtService.generateToken({
      tokenPayload: { ...commonTokenPayload, type: ETokenType.REFRESH_TOKEN },
    });

    // Store user tokens
    await this.userTokenService.processUserToken({
      mode: EProcessUserTokenMode.CREATE_NEW_TOKEN_PAIR,
      userId: id,
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
  async signOut(req: TRequest, res: Response): Promise<HttpStatus> {
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
  async refreshToken(req: TRequest, payload: RefreshTokenDto) {
    const refreshToken = req.cookies[ECookieKey.REFRESH_TOKEN]!;
    const { accessToken } = payload;

    // Check refreshToken valid
    const { id, email } = await this.checkToken({
      type: ETokenType.REFRESH_TOKEN,
      token: refreshToken,
      errorMessage: ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
    });

    // Check the refreshToken already exist
    const { id: refreshTokenId } = await this.userTokenService.checkExist({
      where: {
        userId: id,
        type: ETokenType.REFRESH_TOKEN,
        hashToken: this.userTokenService.generateHashToken(refreshToken),
      },
    });

    // Check the accessToken already exist
    await this.userTokenService.checkExist(
      {
        where: {
          userId: id,
          type: ETokenType.ACCESS_TOKEN,
          hashToken: this.userTokenService.generateHashToken(accessToken),
          refreshTokenId,
        },
      },
      ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
    );

    // Verify accessToken has expired
    try {
      await this.checkToken({ type: ETokenType.ACCESS_TOKEN, token: accessToken });
    } catch (error) {
      if (error.message !== 'jwt expired')
        throw new BadRequestException({ message: ERROR_MESSAGES.ACCESS_TOKEN_INVALID });
    }

    // Generate new accessToken
    const newAccessToken = this.jwtService.generateToken({
      tokenPayload: { id, email, type: ETokenType.ACCESS_TOKEN },
    });

    // Store new accessToken
    await this.userTokenService.processUserToken({
      mode: EProcessUserTokenMode.REFRESH_ACCESS_TOKEN,
      userId: id,
      refreshTokenId,
      newAccessToken,
    });

    // Set the new cache data to redis
    const hashNewAccessToken = this.userTokenService.generateHashToken(newAccessToken);
    const cacheKey = `${ETableName.USERS}/${id}/${hashNewAccessToken}`;
    this.redisCacheService.set<UserEntity>(cacheKey, req.authUser, ACCESS_TOKEN_EXPIRES_IN);

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
    await this.handleTransactionAndRelease(
      queryRunner,

      // Process function
      async () => {
        // Update new password
        await queryRunner.manager.update(UserEntity, authId, {
          password: newHashPassword,
        });

        //  Process user tokens
        await this.userTokenService.processUserToken({
          mode: EProcessUserTokenMode.RESET_AND_CREATE_NEW_TOKEN_PAIR,
          txRepository: queryRunner.manager.getRepository(UserTokenEntity),
          userId: authId,
          newRefreshToken,
          newAccessToken,
        });
      },
    );

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
