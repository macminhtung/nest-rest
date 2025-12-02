import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TaskService } from '@/modules/task/task.service';
import { TaskEntity } from '@/modules/task/task.entity';
import { CreateTaskDto, UpdateTaskDto, GetTasksPaginatedDto } from '@/modules/task/dtos';
import { UserService } from '@/modules/user/user.service';
import { ProjectService } from '@/modules/project/project.service';
import { EOrder, ETaskStatus } from '@/common/enums';
import { UserEntity } from '../user/user.entity';
import { DEFAULT_ROLES } from '@/common/constants';
import { ProjectEntity } from '../project/project.entity';
import { DeleteRecordResponseDto } from '@/common/dtos';

describe('TaskService', () => {
  let service: TaskService;

  const initTask1: TaskEntity = {
    id: 'uuid-1',
    name: 'Task 1',
    description: 'Description 1',
    projectId: 'projectId',
    userId: 'userId',
    status: ETaskStatus.TODO,
    createdAt: new Date(),
  };

  const initTask2: TaskEntity = {
    id: 'uuid-2',
    name: 'Task 2',
    description: 'Description 2',
    projectId: 'projectId',
    userId: 'userId',
    status: ETaskStatus.TODO,
    createdAt: new Date(),
  };

  const initUser: UserEntity = {
    id: 'uuid-user',
    email: 'user@gmail.com',
    firstName: 'FirstName',
    lastName: 'LastName',
    location: 'Location',
    password: '',
    roleId: DEFAULT_ROLES.USER.id,
    createdAt: new Date(),
  };

  const initProject: ProjectEntity = {
    id: 'uuid-project',
    name: 'Project',
    description: 'Description',
    createdAt: new Date(),
  };

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
    it('Should create new task', async () => {
      const createPayload: CreateTaskDto = {
        name: initTask1.name,
        description: initTask1.description,
        userId: initUser.id,
        projectId: initProject.id,
        status: ETaskStatus.TODO,
      };

      mockUserService.checkExist.mockResolvedValue(initUser);
      mockProjectService.checkExist.mockResolvedValue(initProject);
      mockTaskRepository.save.mockResolvedValue({ ...initTask1, ...createPayload });
      const result = await service.createTask(createPayload);

      expect(mockUserService.checkExist).toHaveBeenCalledWith({
        where: { id: createPayload.userId },
      });
      expect(mockProjectService.checkExist).toHaveBeenCalledWith({
        where: { id: createPayload.projectId },
      });
      expect(result).toHaveProperty('id');
      expect(result).toEqual({ ...initTask1, ...createPayload });
    });
  });

  // #=====================#
  // # ==> UPDATE TASK <== #
  // #=====================#
  describe('updateTask', () => {
    it('Should update task', async () => {
      const payload: UpdateTaskDto = {
        name: 'Updated name',
        description: 'Updated description',
        userId: 'user-uuid',
        projectId: 'project-uuid',
      };
      jest.spyOn(service, 'checkExist').mockResolvedValue(initTask1);

      mockUserService.checkExist.mockResolvedValue(initTask1);
      mockProjectService.checkExist.mockResolvedValue(initProject);
      mockTaskRepository.update.mockResolvedValue(undefined);

      const result = await service.updateTask(initTask1.id, payload);

      expect(service.checkExist).toHaveBeenCalled();
      expect(mockTaskRepository.update).toHaveBeenCalledWith(initTask1.id, payload);
      expect(result.name).toBe(payload.name);
      expect(result.description).toBe(payload.description);
    });
  });

  // #========================#
  // # ==> GET TASK BY ID <== #
  // #========================#
  describe('getTaskById', () => {
    it('should return task by id', async () => {
      const loadUser = true;
      const loadProject = false;

      jest.spyOn(service, 'checkExist').mockResolvedValue(initTask1);
      const result = await service.getTaskById(initTask1.id, loadUser, loadProject);

      expect(service.checkExist).toHaveBeenCalledWith({
        where: { id: initTask1.id },
        relations: { user: loadUser, project: loadProject },
      });
      expect(result).toBe(initTask1);
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
      const tasks = [initTask1, initTask2];
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
    it('Should delete task successfully', async () => {
      const deletedResponse: DeleteRecordResponseDto = {
        deleted: true,
        message: 'Task deleted successfully',
      };

      jest.spyOn(service, 'checkExist').mockResolvedValue(initTask1);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteTaskById(initTask1.id);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id: initTask1.id } });
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(initTask1.id);
      expect(result).toEqual(deletedResponse);
    });
  });
});
