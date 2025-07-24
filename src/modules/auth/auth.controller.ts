import { Controller, Post, Put, Get, Body, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { Public } from '@/decorators';
import { ApiOkResponsePaginated } from '@/common/dtos';
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
  signUp(@Body() payload: SignUpDto) {
    return this.authService.signUp(payload);
  }

  // #================#
  // # ==> SIGNIN <== #
  // #================#
  @Public()
  @ApiOkResponse({ type: SignInResponseDto })
  @Post('signin')
  signIn(@Res({ passthrough: true }) res: Response, @Body() payload: SignInDto) {
    return this.authService.signIn(res, payload);
  }

  // #=======================#
  // # ==> REFRESH TOKEN <== #
  // #=======================#
  @Public()
  @ApiOkResponse({ type: SignInResponseDto })
  @Post('refresh-token')
  refreshToken(@Req() req: TRequest, @Body() payload: RefreshTokenDto) {
    return this.authService.refreshToken(req, payload);
  }

  // #=========================#
  // # ==> UPDATE PASSWORD <== #
  // #=========================#
  @ApiOkResponse({ type: SignInResponseDto })
  @Put('update-password')
  updatePassword(
    @Req() req: TRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() payload: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(req, res, payload);
  }

  // #=====================#
  // # ==> GET PROFILE <== #
  // #=====================#
  @ApiOkResponsePaginated(UserEntity)
  @Get('/profile')
  getProfile(@Req() req: TRequest) {
    return this.authService.getProfile(req);
  }
}
