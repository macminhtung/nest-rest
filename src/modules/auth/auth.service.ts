import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { ERROR_MESSAGES, DEFAULT_ROLES } from '@/common/constants';
import { ECookieKey } from '@/common/enums';
import type { TRequest } from '@/common/types';
import { BaseService } from '@/common/base.service';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { JwtService, ETokenType, TVerifyToken } from '@/modules/shared/services';
import {
  SignUpDto,
  SignInDto,
  SignInResponseDto,
  RefreshTokenDto,
  UpdatePasswordDto,
} from '@/modules/auth/dtos';

@Injectable()
export class AuthService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,

    private userService: UserService,
    private jwtService: JwtService,
  ) {
    super(repository);
  }

  // #=====================#
  // # ==> CHECK TOKEN <== #
  // #=====================#
  async checkToken<T extends ETokenType>(payload: TVerifyToken<T>): Promise<UserEntity> {
    // Verify token
    const decodeToken = this.jwtService.verifyToken(payload);

    // Check user already exists
    const { id, passwordTimestamp } = decodeToken;
    const existedUser = await this.userService.checkExist({
      select: [
        'id',
        'avatar',
        'email',
        'password',
        'firstName',
        'lastName',
        'roleId',
        'isEmailVerified',
        'passwordTimestamp',
        'role',
      ],
      where: { id, isEmailVerified: true },
      relations: { role: true },
    });

    // Check passwordTimestamp is correct
    if (passwordTimestamp !== existedUser.passwordTimestamp)
      throw new BadRequestException({ message: ERROR_MESSAGES.TIMESTAMP_INCORRECT });

    return existedUser;
  }

  // #================================#
  // # ==> GENERATE HASH PASSWORD <== #
  // #================================#
  async generateHashPassword(password: string): Promise<string> {
    const hashPassword = await hash(password, 10);
    return hashPassword;
  }

  // #===============================#
  // # ==> COMPARE HASH PASSWORD <== #
  // #===============================#
  async compareHashPassword(payload: { password: string; hashPassword: string }): Promise<boolean> {
    const { password, hashPassword } = payload;
    return await compare(password, hashPassword);
  }

  // #=======================================#
  // # ==> SET REFRESH_TOKEN INTO COOKIE <== #
  // #=======================================#
  setRefreshTokenIntoCookie(res: Response, refreshToken: string) {
    const isProductionMode = process.env.NODE_ENV === 'prod';

    res.cookie(ECookieKey.REFRESH_TOKEN, refreshToken, {
      domain: isProductionMode ? process.env.DOMAIN : undefined,
      path: '/',
      secure: isProductionMode,
      httpOnly: true,
      sameSite: 'none',
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

    // Create the passwordTimestamp
    const passwordTimestamp = new Date().valueOf().toString();

    // Hash the password
    const hashPassword = await this.generateHashPassword(password);

    // Create a new user
    const newUser = await this.repository.save({
      email,
      password: hashPassword,
      firstName,
      lastName,
      isEmailVerified: true,
      passwordTimestamp,
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
      select: ['id', 'password', 'passwordTimestamp'],
      where: { email, isEmailVerified: true },
    });
    const { id, passwordTimestamp } = existUser;

    // Check password is valid
    const isValidPassword = await this.compareHashPassword({
      password,
      hashPassword: existUser.password,
    });
    if (!isValidPassword)
      throw new BadRequestException({ message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });

    // Generate accessToken
    const commonTokenPayload = { id, email, passwordTimestamp };
    const accessToken = this.jwtService.generateToken({
      type: ETokenType.ACCESS_TOKEN,
      tokenPayload: { ...commonTokenPayload, isAccessToken: true },
    });

    // Generate refreshToken
    const refreshToken = this.jwtService.generateToken({
      type: ETokenType.REFRESH_TOKEN,
      tokenPayload: { ...commonTokenPayload, isRefreshToken: true },
      options: { expiresIn: '30 days' },
    });

    // Set refreshToken into cookie
    this.setRefreshTokenIntoCookie(res, refreshToken);

    return { accessToken };
  }

  // #=================#
  // # ==> SIGNOUT <== #
  // #=================#
  signOut(res: Response): HttpStatus {
    // Clear refreshToken into cookie
    this.setRefreshTokenIntoCookie(res, '');

    return HttpStatus.OK;
  }

  // #=======================#
  // # ==> REFRESH TOKEN <== #
  // #=======================#
  async refreshToken(req: TRequest, payload: RefreshTokenDto) {
    const refreshToken = req.cookies[ECookieKey.REFRESH_TOKEN];
    const { accessToken } = payload;

    // Check refreshToken valid
    const { id, email, passwordTimestamp } = await this.checkToken({
      type: ETokenType.REFRESH_TOKEN,
      token: refreshToken,
    });

    // Verify accessToken has expired
    try {
      await this.checkToken({ type: ETokenType.ACCESS_TOKEN, token: accessToken });
    } catch (error) {
      if (error.message !== 'jwt expired')
        throw new BadRequestException({ message: ERROR_MESSAGES.ACCESS_TOKEN_INVALID });
    }

    // Generate new accessToken
    const newAccessToken = this.jwtService.generateToken({
      type: ETokenType.ACCESS_TOKEN,
      tokenPayload: { id, email, passwordTimestamp, isAccessToken: true },
    });

    return { accessToken: newAccessToken };
  }

  // #=========================#
  // # ==> UPDATE PASSWORD <== #
  // #=========================#
  async updatePassword(req: TRequest, res: Response, payload: UpdatePasswordDto) {
    const { id: authId, email, password } = req.authUser;
    const { oldPassword, newPassword } = payload;

    // Check refreshToken valid
    const refreshToken = req.cookies[ECookieKey.REFRESH_TOKEN];
    await this.checkToken({
      type: ETokenType.REFRESH_TOKEN,
      token: refreshToken,
    });

    // Compare hashPassword with oldPassword
    const isCorrectPassword = await this.compareHashPassword({
      password: oldPassword,
      hashPassword: password,
    });
    if (!isCorrectPassword)
      throw new BadRequestException({ message: ERROR_MESSAGES.PASSWORD_INCORRECT });

    // Set new password
    const newPasswordTimestamp = new Date().valueOf().toString();
    const hashPassword = await this.generateHashPassword(newPassword);
    await this.userService.repository.update(authId, {
      password: hashPassword,
      passwordTimestamp: newPasswordTimestamp,
    });

    // Generate accessToken
    const commonTokenPayload = { id: authId, email, passwordTimestamp: newPasswordTimestamp };
    const newAccessToken = this.jwtService.generateToken({
      type: ETokenType.ACCESS_TOKEN,
      tokenPayload: { ...commonTokenPayload, isAccessToken: true },
    });

    // Generate refreshToken
    const newRefreshToken = this.jwtService.generateToken({
      type: ETokenType.REFRESH_TOKEN,
      tokenPayload: { ...commonTokenPayload, isRefreshToken: true },
      options: { expiresIn: '30 days' },
    });

    // Set refreshToken into cookie
    this.setRefreshTokenIntoCookie(res, newRefreshToken);

    return { accessToken: newAccessToken };
  }

  // #=====================#
  // # ==> GET PROFILE <== #
  // #=====================#
  getProfile(request: TRequest) {
    return { ...request.authUser, password: undefined, passwordTimestamp: undefined };
  }
}
