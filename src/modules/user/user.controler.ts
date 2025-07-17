import { Controller, Put, Param, Body } from '@nestjs/common';
import { EEntity } from '@/common/enum';
import { UserService } from '@/modules/user/user.service';
import { UpdateUserDto } from '@/modules/user/dto';

@Controller(EEntity.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.userService.repository.save({ id, ...payload });
  }
}
