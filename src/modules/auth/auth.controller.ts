import { Controller, Post, Put, Get, Delete, Body, Req, Res, HttpStatus } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
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
  GeneratePreSignedUrlDto,
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
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() payload: SignInDto,
  ): Promise<SignInResponseDto> {
    return this.authService.signIn(res, payload);
  }

  // #=================#
  // # ==> SIGNOUT <== #
  // #=================#
  @ApiOkResponse({ type: String, example: HttpStatus.OK })
  @Delete('signout')
  signOut(@Res({ passthrough: true }) res: FastifyReply): HttpStatus {
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
    @Res({ passthrough: true }) res: FastifyReply,
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

  // # =============================== #
  // # ==> GENERATE PRE-SIGNED URL <== #
  // # =============================== #
  @ApiOkResponse({ type: String })
  @Post('/presigned-url')
  generatePreSignedUrl(
    @Req() req: TRequest,
    @Body() payload: GeneratePreSignedUrlDto,
  ): Promise<string> {
    return this.authService.generatePreSignedUrl(req, payload);
  }
}
