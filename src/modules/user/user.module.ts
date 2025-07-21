import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';
import { UserController } from '@/modules/user/user.controller';
import { RoleEntity } from '@/modules/user/role/role.entity';
import { RoleService } from '@/modules/user/role/role.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
  controllers: [UserController],
  providers: [UserService, RoleService],
  exports: [UserService, RoleService],
})
export class UserModule {}
