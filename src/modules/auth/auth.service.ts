import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { ERROR_MESSAGES } from '@/common/constants';
import { BaseService } from '@/common/base.service';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { JwtService } from '@/modules/shared/services';
import { SignInDto, SignInResponseDto } from '@/modules/auth/dtos';

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
  async checkToken(
    payload:
      | { accessToken: string; refreshToken?: undefined }
      | { accessToken?: undefined; refreshToken: string },
  ): Promise<UserEntity> {
    const { accessToken, refreshToken } = payload;

    // Verify token
    const token = accessToken || refreshToken || '';
    const decodeToken = this.jwtService.verifyToken(token);

    // Check user already exists
    const { id, passwordTimestamp } = decodeToken!;
    const existedUser = await this.userService.checkExist({
      where: { id, isEmailVerified: true },
      relations: { role: true },
    });

    // Check passwordTimestamp is correct
    if (passwordTimestamp !== existedUser.passwordTimestamp)
      throw new BadRequestException({ message: ERROR_MESSAGES.TIMESTAMP_INCORRECT });

    // CASE: ACCESS_TOKEN
    if (accessToken && !decodeToken?.isAccessToken)
      throw new BadRequestException({ message: ERROR_MESSAGES.ACCESS_TOKEN_INVALID });
    // CASE: REFRESH_TOKEN
    else if (refreshToken && !decodeToken?.isRefreshToken)
      throw new BadRequestException({ message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });

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

  // #================#
  // # ==> SIGNIN <== #
  // #================#
  async signIn(payload: SignInDto): Promise<SignInResponseDto> {
    const { email, password } = payload;

    // Check email already exists
    const existUser = await this.userService.checkExist({ email });
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
    const accessTokenPayload = { ...commonTokenPayload, isAccessToken: true };
    const accessToken = this.jwtService.signPayload(accessTokenPayload);

    // Generate refreshToken
    const refreshTokenPayload = { ...commonTokenPayload, isRefreshToken: true };
    const refreshToken = this.jwtService.signPayload(refreshTokenPayload, {
      expiresIn: '360 days',
    });

    return { accessToken, refreshToken };
  }
}
