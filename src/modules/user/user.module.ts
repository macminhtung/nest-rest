import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';
import { UserController } from '@/modules/user/user.controller';
import { RoleEntity } from '@/modules/user/role/role.entity';
import { RoleService } from '@/modules/user/role/role.service';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';
import { UserTokenService } from '@/modules/user/user-token/user-token.service';
import { RedisCacheModule } from '@/modules/redis-cache/redis-cache.module';
import { UserTokenCacheService } from '@/modules/user/user-token/user-token-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, UserTokenEntity]), RedisCacheModule],
  controllers: [UserController],
  providers: [UserService, RoleService, UserTokenService, UserTokenCacheService],
  exports: [UserService, RoleService, UserTokenService, UserTokenCacheService],
})
export class UserModule {}
