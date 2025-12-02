import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '@/modules/task/task.controller';
import { TaskService } from '@/modules/task/task.service';
import { TaskEntity } from '@/modules/task/task.entity';
import { CreateTaskDto, UpdateTaskDto, GetTasksPaginatedDto } from '@/modules/task/dtos';
import { DeleteRecordResponseDto, PaginatedResponseDto } from '@/common/dtos';
import { ETaskStatus } from '@/common/enums';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const initTask1: TaskEntity = {
    id: 'uuid-1',
    name: 'Name 1',
    description: 'Description 1',
    status: ETaskStatus.TODO,
    projectId: 'projectId',
    userId: 'userId',
    createdAt: new Date(),
  };
  const initTask2: TaskEntity = {
    id: 'uuid-2',
    name: 'Name 2',
    description: 'Description 2',
    status: ETaskStatus.TODO,
    projectId: 'projectId',
    userId: 'userId',
    createdAt: new Date(),
  };

  const mockService = {
    createTask: jest.fn(),
    updateTask: jest.fn(),
    getTaskById: jest.fn(),
    getPaginatedTasks: jest.fn(),
    deleteTaskById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: mockService }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => jest.clearAllMocks());

  // #=====================#
  // # ==> CREATE TASK <== #
  // #=====================#
  describe('createTask', () => {
    it('Should create task', async () => {
      const createPayload: CreateTaskDto = {
        name: initTask1.name,
        description: initTask1.description,
        userId: initTask1.userId,
        projectId: initTask1.projectId,
        status: initTask1.status,
      };

      mockService.createTask.mockResolvedValue(initTask1);
      const result = await controller.createTask(createPayload);

      expect(service.createTask).toHaveBeenCalledWith(createPayload);
      expect(result).toEqual(initTask1);
    });
  });

  // #=====================#
  // # ==> UPDATE TASK <== #
  // #=====================#
  it('Should update task', async () => {
    const updatePayload: UpdateTaskDto = { name: 'Updated name' };
    const updatedTask: TaskEntity = { ...initTask1, ...updatePayload };

    mockService.updateTask.mockResolvedValue(updatedTask);
    const result = await controller.updateTask(initTask1.id, updatePayload);

    expect(service.updateTask).toHaveBeenCalledWith(initTask1.id, updatePayload);
    expect(result).toEqual(updatedTask);
  });

  // #========================#
  // # ==> GET TASK BY ID <== #
  // #========================#
  it('Should get task by id', async () => {
    mockService.getTaskById.mockResolvedValue(initTask1);
    const result = await controller.getTaskById(initTask1.id);

    expect(result).toEqual(initTask1);
  });

  // #=============================#
  // # ==> GET PAGINATED TASKS <== #
  // #=============================#
  describe('Should get paginated tasks', () => {
    it('Return paginated tasks', async () => {
      const query: GetTasksPaginatedDto = { page: 1, take: 10 };
      const tasks: TaskEntity[] = [initTask1, initTask2];
      const paginatedResponse = new PaginatedResponseDto<TaskEntity>({
        args: query,
        total: tasks.length,
        records: tasks,
      });

      mockService.getPaginatedTasks.mockResolvedValue(paginatedResponse);
      const result = await controller.getPaginatedUsers(query);

      expect(service.getPaginatedTasks).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResponse);
      expect(result.page).toBe(query.page);
      expect(result.take).toBe(query.take);
      expect(result.total).toBe(tasks.length);
      expect(result.records.length).toBe(tasks.length);
    });
  });

  // #===========================#
  // # ==> DELETE TASK BY ID <== #
  // #===========================#
  it('Should delete task', async () => {
    const expected: DeleteRecordResponseDto = {
      deleted: true,
      message: 'Task deleted sucessfully',
    };

    mockService.deleteTaskById.mockResolvedValue(expected);
    const result = await controller.deleteTaskById(initTask1.id);

    expect(service.deleteTaskById).toHaveBeenCalledWith(initTask1.id);
    expect(result).toEqual(expected);
  });
});
