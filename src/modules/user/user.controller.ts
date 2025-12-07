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
import { ApiOkResponse } from '@nestjs/swagger';
import { ETableName, ERoleName } from '@/common/enums';
import { Roles } from '@/decorators';
import { ApiOkResponsePaginated, DeleteRecordResponseDto } from '@/common/dtos';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';
import type { TRequest } from '@/common/types';

@Controller(ETableName.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // #=====================#
  // # ==> CREATE USER <== #
  // #=====================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: UserEntity })
  @Post()
  createUser(@Body() payload: CreateUserDto) {
    return this.userService.createUser(payload);
  }

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: UserEntity })
  @Patch(':id')
  updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateUserDto) {
    return this.userService.updateUser(id, payload);
  }

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponsePaginated(UserEntity)
  @Get(':id')
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserById(id);
  }

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponsePaginated(UserEntity)
  @Get()
  getPaginatedUsers(@Query() queryParams: GetUsersPaginatedDto) {
    return this.userService.getPaginatedUsers(queryParams);
  }

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: DeleteRecordResponseDto })
  @Delete(':id')
  deleteUserById(
    @Req() req: TRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteRecordResponseDto> {
    return this.userService.deleteUserById(req.authUser, id);
  }
}
