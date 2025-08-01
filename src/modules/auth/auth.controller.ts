import { Controller, Post, Put, Get, Delete, Body, Req, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOkResponse, OmitType } from '@nestjs/swagger';
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
  UpdateProfileDto,
  CreateSignedUrlDto,
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
  @Delete('signout')
  signOut(@Res({ passthrough: true }) res: Response): HttpStatus {
    return this.authService.signOut(res);
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

  // #=====================#
  // # ==> GET PROFILE <== #
  // #=====================#
  @ApiOkResponse({ type: OmitType(UserEntity, ['password', 'passwordTimestamp']) })
  @Get('/profile')
  getProfile(@Req() req: TRequest): Omit<UserEntity, 'password' | 'passwordTimestamp'> {
    return this.authService.getProfile(req);
  }

  // #========================#
  // # ==> UPDATE PROFILE <== #
  // #========================#
  @ApiOkResponse({ type: UpdateProfileDto })
  @Put('/profile')
  updateProfile(
    @Req() req: TRequest,
    @Body() payload: UpdateProfileDto,
  ): Promise<UpdateProfileDto> {
    return this.authService.updateProfile(req, payload);
  }

  // # ========================= #
  // # ==> CREATE SIGNED URL <== #
  // # ========================= #
  @ApiOkResponse({ type: String })
  @Post('/signed-url')
  createSignedUrl(@Req() req: TRequest, @Body() payload: CreateSignedUrlDto): Promise<string> {
    return this.authService.createSignedUrl(req, payload);
  }
}
