import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TaskService } from '@/modules/task/task.service';
import { TaskEntity } from '@/modules/task/task.entity';
import { CreateTaskDto, UpdateTaskDto, GetTasksPaginatedDto } from '@/modules/task/dtos';
import { UserService } from '@/modules/user/user.service';
import { ProjectService } from '@/modules/project/project.service';
import { EOrder, ETaskStatus } from '@/common/enums';

describe('TaskService', () => {
  let service: TaskService;

  // Mock repository
  const mockTaskRepository = {
    metadata: { name: 'TaskEntity' },
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserService = { checkExist: jest.fn() };
  const mockProjectService = { checkExist: jest.fn() };
  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockTaskRepository),
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(TaskEntity), useValue: mockTaskRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: UserService, useValue: mockUserService },
        { provide: ProjectService, useValue: mockProjectService },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => jest.clearAllMocks());

  // #=====================#
  // # ==> CREATE TASK <== #
  // #=====================#
  describe('createTask', () => {
    it('should create new task', async () => {
      const createPayload: CreateTaskDto = {
        name: 'Task A',
        description: 'Desc',
        userId: 'user-uuid',
        projectId: 'project-uuid',
        status: ETaskStatus.TODO,
      };

      mockUserService.checkExist.mockResolvedValue(undefined);
      mockProjectService.checkExist.mockResolvedValue(undefined);
      mockTaskRepository.save.mockResolvedValue({ id: 'uuid', ...createPayload });

      const result = await service.createTask(createPayload);

      expect(mockUserService.checkExist).toHaveBeenCalledWith({
        where: { id: createPayload.userId },
      });
      expect(mockProjectService.checkExist).toHaveBeenCalledWith({
        where: { id: createPayload.projectId },
      });
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createPayload.name);
    });
  });

  // #=====================#
  // # ==> UPDATE TASK <== #
  // #=====================#
  describe('updateTask', () => {
    it('should update existing task', async () => {
      const id = 'task-uuid';
      const payload: UpdateTaskDto = {
        name: 'Updated',
        description: 'New',
        userId: 'user-uuid',
        projectId: 'project-uuid',
      };
      const existedTask: TaskEntity = {
        id,
        name: 'Old',
        description: '',
        userId: 'old',
        projectId: 'old',
        createdAt: new Date(),
        status: ETaskStatus.TODO,
      };
      jest.spyOn(service, 'checkExist').mockResolvedValue(existedTask);

      mockUserService.checkExist.mockResolvedValue(undefined);
      mockProjectService.checkExist.mockResolvedValue(undefined);
      mockTaskRepository.update.mockResolvedValue(undefined);

      const result = await service.updateTask(id, payload);

      expect(service.checkExist).toHaveBeenCalled();
      expect(mockTaskRepository.update).toHaveBeenCalledWith(id, payload);
      expect(result.name).toBe(payload.name);
      expect(result.description).toBe(payload.description);
    });
  });

  // #========================#
  // # ==> GET TASK BY ID <== #
  // #========================#
  describe('getTaskById', () => {
    it('should return task by id', async () => {
      const existedTaskId = 'uuid';
      const existedTask: TaskEntity = {
        id: existedTaskId,
        name: 'Old',
        description: '',
        userId: 'old',
        projectId: 'old',
        createdAt: new Date(),
        status: ETaskStatus.TODO,
      };
      const loadUser = true;
      const loadProject = false;

      jest.spyOn(service, 'checkExist').mockResolvedValue(existedTask);

      const result = await service.getTaskById(existedTaskId, loadUser, loadProject);

      expect(service.checkExist).toHaveBeenCalledWith({
        where: { id: existedTaskId },
        relations: { user: loadUser, project: loadProject },
      });
      expect(result).toBe(existedTask);
    });
  });

  // #=============================#
  // # ==> GET PAGINATED TASKS <== #
  // #=============================#
  describe('getPaginatedTasks', () => {
    it('should return paginated tasks', async () => {
      const args: GetTasksPaginatedDto = {
        page: 1,
        take: 10,
        order: EOrder.ASC,
      };
      const existedTask1: TaskEntity = {
        id: 'uuid1',
        name: 'task1',
        description: '',
        userId: 'userId',
        projectId: 'projectId',
        createdAt: new Date(),
        status: ETaskStatus.TODO,
      };
      const existedTask2: TaskEntity = {
        id: 'uuid2',
        name: 'task2',
        description: '',
        userId: 'userId',
        projectId: 'projectId',
        createdAt: new Date(),
        status: ETaskStatus.TODO,
      };

      const tasks = [existedTask1, existedTask2];
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tasks, tasks.length]),
      };
      mockTaskRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getPaginatedTasks(args);

      expect(qb.leftJoinAndSelect).toHaveBeenCalled();
      expect(result.records).toEqual(tasks);
      expect(result.total).toBe(tasks.length);
      expect(result.page).toBe(args.page);
      expect(result.take).toBe(args.take);
    });
  });

  // #===========================#
  // # ==> DELETE TASK BY ID <== #
  // #===========================#
  describe('deleteTaskById', () => {
    it('should delete task successfully', async () => {
      const existedTaskId = 'task-uuid';
      const existedTask: TaskEntity = {
        id: existedTaskId,
        name: 'Task A',
        description: 'Desc',
        userId: 'user-uuid',
        projectId: 'project-uuid',
        status: ETaskStatus.TODO,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'checkExist').mockResolvedValue(existedTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteTaskById(existedTaskId);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id: existedTaskId } });
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(existedTaskId);
      expect(result).toEqual({ deleted: true, message: 'Task deleted sucessfully' });
    });
  });
});
