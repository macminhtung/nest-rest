import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  Delete,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, OmitType } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { DEFAULT_ROLES } from '@/common/constants';
import { Roles } from '@/decorators';
import { ApiOkResponsePaginated } from '@/common/dtos';
import type { TRequest } from '@/common/types';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { CardInfoDto } from '@/modules/user/dtos/card-info.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  GetUsersPaginatedDto,
  AddCardDto,
} from '@/modules/user/dtos';

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
  @Put(':id')
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
  @Get('/paginated')
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

  // #========================#
  // # ==> GET MY PROFILE <== #
  // #========================#
  @ApiOkResponse({ type: OmitType(UserEntity, ['password']) })
  @Get('me/profile')
  getMyProfile(@Req() req: TRequest) {
    return { ...req.authUser, password: undefined };
  }

  // #===========================#
  // # ==> UPDATE MY PROFILE <== #
  // #===========================#
  @ApiOkResponse({ type: UpdateProfileDto })
  @Put('me/profile')
  updateMyProfile(
    @Req() req: TRequest,
    @Body() payload: UpdateProfileDto,
  ): Promise<UpdateProfileDto> {
    return this.userService.updateMyProfile(req.authUser.id, payload);
  }

  // #=====================#
  // # ==> ADD MY CARD <== #
  // #=====================#
  @ApiOkResponse({ type: Number, example: HttpStatus.OK })
  @Post('me/add-card')
  addMyCard(@Req() req: TRequest, @Body() payload: AddCardDto) {
    return this.userService.addMyCard(req.authUser, payload);
  }

  // #========================#
  // # ==> REMOVE MY CARD <== #
  // #========================#
  @ApiOkResponse({ type: Number, example: HttpStatus.OK })
  @Post('me/remove-card')
  removeMyCard(@Req() req: TRequest, @Body() payload: AddCardDto) {
    return this.userService.removeMyCard(req.authUser, payload);
  }

  // #======================#
  // # ==> GET MY CARDS <== #
  // #======================#
  @ApiOkResponse({ type: CardInfoDto, isArray: true })
  @Get('me/get-cards')
  getMyCards(@Req() req: TRequest) {
    return this.userService.getMyCards(req.authUser);
  }
}
