import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from '@/modules/project/project.module';
import { UserModule } from '@/modules/user/user.module';
import { TaskController } from '@/modules/task/task.controller';
import { TaskService } from '@/modules/task/task.service';
import { TaskEntity } from '@/modules/task/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), UserModule, ProjectModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
