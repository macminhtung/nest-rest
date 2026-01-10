import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '@/modules/user/dtos/create-user.dto';

export class UpdateUserDto extends OmitType(CreateUserDto, ['email']) {}
