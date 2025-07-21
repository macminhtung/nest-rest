import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { EEntity, ERoleName } from '@/common/enums';
import { Roles } from '@/decorators';
import { ApiOkResponsePaginated } from '@/common/dtos';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { UpdateUserDto, GetUsersDto } from '@/modules/user/dtos';

@Controller(EEntity.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: UserEntity })
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.userService.updateUser(id, payload);
  }

  @Roles([ERoleName.ADMIN])
  @ApiOkResponsePaginated(UserEntity)
  @Get()
  getUsers(@Param() params: GetUsersDto) {
    return this.userService.getUsers(params);
  }
}
