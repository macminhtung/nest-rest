import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@/modules/user/user.module';
import { ProjectController } from '@/modules/project/project.controller';
import { ProjectService } from '@/modules/project/project.service';
import { ProjectEntity } from '@/modules/project/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity]), UserModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
