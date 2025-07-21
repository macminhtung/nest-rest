import { Controller, Post, Body } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Public } from '@/decorators';
import { AuthService } from '@/modules/auth/auth.service';
import { SignInDto, SignInResponseDto } from '@/modules/auth/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOkResponse({ type: SignInResponseDto })
  @Post('signIn')
  signIn(@Body() payload: SignInDto) {
    return this.authService.signIn(payload);
  }
}
