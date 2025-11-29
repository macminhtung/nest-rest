import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  Body,
  Delete,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Roles } from '@/decorators';
import type { TRequest } from '@/common/types';
import { ApiOkResponse } from '@nestjs/swagger';
import { ERoleName } from '@/common/enums';
import { ApiOkResponsePaginated, DeleteRecordResponseDto } from '@/common/dtos';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';

@Controller('users')
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
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.userService.updateUser(id, payload);
  }

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: UserEntity })
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
