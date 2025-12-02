import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity } from '@nestjs/swagger';
import { ACCESS_TOKEN_HEADER_KEY } from '@/guards';
import { Roles } from '@/decorators';
import { ERoleName } from '@/common/enums';
import { ApiOkResponsePaginated, DeleteRecordResponseDto } from '@/common/dtos';
import { TaskEntity } from '@/modules/task/task.entity';
import { TaskService } from '@/modules/task/task.service';
import { CreateTaskDto, UpdateTaskDto, GetTasksPaginatedDto } from '@/modules/task/dtos';

@ApiSecurity(ACCESS_TOKEN_HEADER_KEY)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // #=====================#
  // # ==> CREATE TASK <== #
  // #=====================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: TaskEntity })
  @Post()
  async createTask(@Body() body: CreateTaskDto): Promise<TaskEntity> {
    return this.taskService.createTask(body);
  }

  // #=====================#
  // # ==> UPDATE TASK <== #
  // #=====================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: TaskEntity })
  @Patch(':id')
  async updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return this.taskService.updateTask(id, body);
  }

  // #========================#
  // # ==> GET TASK BY ID <== #
  // #========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: TaskEntity })
  @Get(':id')
  async getTaskById(@Param('id', ParseUUIDPipe) id: string): Promise<TaskEntity> {
    return this.taskService.getTaskById(id);
  }

  // #=============================#
  // # ==> GET PAGINATED TASKS <== #
  // #=============================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponsePaginated(TaskEntity)
  @Get()
  getPaginatedUsers(@Query() queryParams: GetTasksPaginatedDto) {
    return this.taskService.getPaginatedTasks(queryParams);
  }

  // #===========================#
  // # ==> DELETE TASK BY ID <== #
  // #===========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: DeleteRecordResponseDto })
  @Delete(':id')
  async deleteTaskById(@Param('id', ParseUUIDPipe) id: string): Promise<DeleteRecordResponseDto> {
    return this.taskService.deleteTaskById(id);
  }
}
