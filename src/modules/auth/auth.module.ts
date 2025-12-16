import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';
import { UserEntity } from '@/modules/user/user.entity';
import { UserModule } from '@/modules/user/user.module';
import { RedisCacheModule } from '@/modules/redis-cache/redis-cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UserModule, RedisCacheModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
