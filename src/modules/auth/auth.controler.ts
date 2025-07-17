import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { SignInDto } from '@/modules/auth/dto';

@Controller('auth')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth')
  signIn(@Body() payload: SignInDto) {
    return this.authService.signIn(payload);
  }
}
