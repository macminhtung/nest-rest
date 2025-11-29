import { Controller, Post, Put, Body, Req, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { Public } from '@/decorators';
import { AuthService } from '@/modules/auth/auth.service';
import { UserEntity } from '@/modules/user/user.entity';
import type { TRequest } from '@/common/types';
import {
  SignUpDto,
  SignInDto,
  SignInResponseDto,
  RefreshTokenDto,
  UpdatePasswordDto,
} from '@/modules/auth/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // #================#
  // # ==> SIGNUP <== #
  // #================#
  @Public()
  @ApiOkResponse({ type: UserEntity })
  @Post('signup')
  signUp(@Body() payload: SignUpDto): Promise<UserEntity> {
    return this.authService.signUp(payload);
  }

  // #================#
  // # ==> SIGNIN <== #
  // #================#
  @Public()
  @ApiOkResponse({ type: SignInResponseDto })
  @Post('signin')
  signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() payload: SignInDto,
  ): Promise<SignInResponseDto> {
    return this.authService.signIn(res, payload);
  }

  // #=================#
  // # ==> SIGNOUT <== #
  // #=================#
  @ApiOkResponse({ type: String, example: HttpStatus.OK })
  @Post('signout')
  signOut(@Req() req: TRequest, @Res({ passthrough: true }) res: Response): Promise<HttpStatus> {
    return this.authService.signOut(req, res);
  }

  // #=======================#
  // # ==> REFRESH TOKEN <== #
  // #=======================#
  @Public()
  @ApiOkResponse({ type: SignInResponseDto })
  @Post('refresh-token')
  refreshToken(@Req() req: TRequest, @Body() payload: RefreshTokenDto): Promise<SignInResponseDto> {
    return this.authService.refreshToken(req, payload);
  }

  // #=========================#
  // # ==> UPDATE PASSWORD <== #
  // #=========================#
  @ApiOkResponse({ type: SignInResponseDto })
  @Put('password')
  updatePassword(
    @Req() req: TRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() payload: UpdatePasswordDto,
  ): Promise<SignInResponseDto> {
    return this.authService.updatePassword(req, res, payload);
  }
}
