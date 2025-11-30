import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { BaseService } from '@/common/base.service';
import { DeleteRecordResponseDto } from '@/common/dtos';
import { ProjectService } from '@/modules/project/project.service';
import { UserService } from '@/modules/user/user.service';
import { TaskEntity } from '@/modules/task/task.entity';
import { CreateTaskDto, UpdateTaskDto, GetTasksPaginatedDto } from '@/modules/task/dtos';

@Injectable()
export class TaskService extends BaseService<TaskEntity> {
  constructor(
    @InjectRepository(TaskEntity)
    public readonly repository: Repository<TaskEntity>,

    private userService: UserService,
    private projectService: ProjectService,
  ) {
    super(repository);
  }

  /**
   * Creates a new task and saves it to the database
   *
   * @param payload - The required information to create a task, and the associated user UUID and project UUID
   * @returns Promise that resolves to the created Task entity
   */
  async createTask(payload: CreateTaskDto): Promise<TaskEntity> {
    const { userId, projectId } = payload;

    // Check the user already exists
    await this.userService.checkExist({ where: { id: userId } });

    // Check the project already exists
    await this.projectService.checkExist({ where: { id: projectId } });

    // Create a new task
    const newTask = await this.repository.save({ id: uuidv7(), ...payload });

    return newTask;
  }

  /**
   * Updates a specific task with the new given attributes
   *
   * @param taskId - The unique UUID of the task
   * @param attrs - Attributes of the Task entity to update, with optional user and project UUIDs
   * @returns Promise that resolves to the updated Task entity
   */
  async updateTask(taskId: string, attrs: UpdateTaskDto): Promise<TaskEntity> {
    const { userId, projectId } = attrs;

    // Check the task already exists
    const existedTask = await this.checkExist({ where: { id: taskId } });

    // Check the user already exists
    await this.userService.checkExist({ where: { id: userId } });

    // Check the project already exists
    await this.projectService.checkExist({ where: { id: projectId } });

    // Update the task
    await this.repository.update(taskId, attrs);

    return { ...existedTask, ...attrs };
  }

  /**
   * Retrieves a task by its UUID from the database
   *
   * @param taskId - The unique UUID of the task
   * @param loadUser - If we want to also return the associated user
   * @param loadProject - If we want to also return the associated project
   * @returns Promise that resolves to the found Task entity
   * @throws {NotFoundException} - If no task is found with the given UUID
   */
  async getTaskById(taskId: string, loadUser = false, loadProject = false): Promise<TaskEntity> {
    // Check the task already exists
    const existedTask = await this.checkExist({
      where: { id: taskId },
      relations: { user: loadUser, project: loadProject },
    });

    return existedTask;
  }

  /**
   * Retrieves a paginated list of users with optional filtering and search.
   * Supports filtering by userId, projectId, and keySearch (name/description).
   * @param queryParams Pagination and filter parameters
   * @returns Paginated result object
   */
  async getPaginatedTasks(queryParams: GetTasksPaginatedDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, (qb) => {
      const { keySearch, userId, projectId } = queryParams;
      const alias = this.entityName;

      qb.leftJoinAndSelect(`${alias}.user`, 'user').leftJoinAndSelect(
        `${alias}.project`,
        'project',
      );

      // Filter based on userId
      if (userId) qb.andWhere(`${alias}.userId = :userId`, { userId });

      // Filter based on projectId
      if (projectId) qb.andWhere(`${alias}.projectId = :projectId`, { projectId });

      // Query based on keySearch
      if (keySearch)
        qb.andWhere(`(${alias}.name ILIKE :keySearch OR ${alias}.description ILIKE :keySearch)`, {
          keySearch: `%${keySearch}`,
        });
    });

    return paginationData;
  }

  /**
   * Deletes a task by its UUID from the database
   *
   * @param taskId - The unique UUID of the task
   * @returns Promise that resolves to the DeleteStatus type
   */
  async deleteTaskById(taskId: string): Promise<DeleteRecordResponseDto> {
    // Check the task already exists
    await this.checkExist({ where: { id: taskId } });

    // Delete the task
    await this.repository.delete(taskId);

    return { deleted: true, message: 'Task deleted sucessfully' };
  }
}
