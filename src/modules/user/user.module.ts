import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';
import { UserController } from '@/modules/user/user.controller';
import { RoleEntity } from '@/modules/user/role/role.entity';
import { RoleService } from '@/modules/user/role/role.service';
import { TokenManagementEntity } from '@/modules/user/token-management/token-management.entity';
import { TokenManagementService } from '@/modules/user/token-management/token-management.service';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity, RoleEntity, TokenManagementEntity])],
  controllers: [UserController],
  providers: [UserService, RoleService, TokenManagementService],
  exports: [UserService, RoleService, TokenManagementService],
})
export class UserModule {}
