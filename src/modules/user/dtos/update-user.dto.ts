import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@/modules/user/dtos';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'])) {}
