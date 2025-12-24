import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  Delete,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { DEFAULT_ROLES } from '@/common/constants';
import { Roles } from '@/decorators';
import { ApiOkResponsePaginated } from '@/common/dtos';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';
import type { TRequest } from '@/common/types';

@ApiBearerAuth()
@Controller(ETableName.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // #=====================#
  // # ==> CREATE USER <== #
  // #=====================#
  @Roles([DEFAULT_ROLES.ADMIN.id])
  @ApiOkResponse({ type: UserEntity })
  @Post()
  createUser(@Body() payload: CreateUserDto) {
    return this.userService.createUser(payload);
  }

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  @Roles([DEFAULT_ROLES.ADMIN.id])
  @ApiOkResponse({ type: UserEntity })
  @Patch(':id')
  updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateUserDto) {
    return this.userService.updateUser(id, payload);
  }

  // #==================#
  // # ==> GET USER <== #
  // #==================#
  @Roles([DEFAULT_ROLES.ADMIN.id])
  @ApiOkResponsePaginated(UserEntity)
  @Get(':id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUser(id);
  }

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  @Roles([DEFAULT_ROLES.ADMIN.id])
  @ApiOkResponsePaginated(UserEntity)
  @Get()
  getPaginatedUsers(@Query() queryParams: GetUsersPaginatedDto) {
    return this.userService.getPaginatedUsers(queryParams);
  }

  // #=====================#
  // # ==> DELETE USER <== #
  // #=====================#
  @Roles([DEFAULT_ROLES.ADMIN.id])
  @ApiOkResponse({ type: String })
  @Delete(':id')
  deleteUser(@Req() req: TRequest, @Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.userService.deleteUser(req.authUser, id);
  }
}
