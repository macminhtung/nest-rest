import { Controller, Post, Body } from '@nestjs/common';
import { EEntity } from '@/common/enum';
import { UserService } from '@/modules/user/user.service';
import { SignInDto } from '@/modules/auth/dto';

@Controller(EEntity.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth')
  signIn(@Body() payload: SignInDto) {}
}
