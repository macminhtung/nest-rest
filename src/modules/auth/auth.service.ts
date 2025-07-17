import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { BaseService } from '@/common/base.service';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { JwtService } from '@/modules/shared/services';
import { SignInDto, SignInResponseDto } from '@/modules/auth/dto';

@Injectable()
export class AuthService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,

    private userService: UserService,
    private jwtService: JwtService
  ) {
    super(repository);
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
      throw new BadRequestException({
        message: 'PASSWORD_INCORRECT',
      });

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
