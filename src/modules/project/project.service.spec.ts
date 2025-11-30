import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProjectService } from '@/modules/project/project.service';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserService } from '@/modules/user/user.service';
import { DeleteRecordResponseDto, PaginatedResponseDto } from '@/common/dtos';
import {
  CreateProjectDto,
  UpdateProjectDto,
  GetProjectsPaginatedDto,
} from '@/modules/project/dtos';
import { DataSource } from 'typeorm';

describe('ProjectService', () => {
  let service: ProjectService;

  const mockProject: ProjectEntity = {
    id: 'uuid-1234',
    name: 'Test Project',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  } as unknown as ProjectEntity;

  const mockUser = { id: 'user-123', name: 'User Test' };

  const queryBuilderMock = {
    relation: jest.fn().mockReturnThis(),
    of: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const repositoryMock = {
    metadata: { name: 'ProjectEntity' },
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
  };

  const userServiceMock = {
    checkExist: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(repositoryMock),
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getRepositoryToken(ProjectEntity), useValue: repositoryMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);

    jest.clearAllMocks();
  });

  // #========================#
  // # ==> CREATE PROJECT <== #
  // #========================#
  describe('createProject', () => {
    it('should create and return a project', async () => {
      repositoryMock.save.mockResolvedValue(mockProject);
      const dto: CreateProjectDto = { name: 'Test Project', description: 'Test Description' };
      const result = await service.createProject(dto);
      expect(result).toEqual(mockProject);
      expect(repositoryMock.save).toHaveBeenCalledWith(expect.objectContaining(dto));
    });
  });

  // #========================#
  // # ==> UPDATE PROJECT <== #
  // #========================#
  describe('updateProject', () => {
    it('should update and return a project', async () => {
      repositoryMock.findOne.mockResolvedValue(mockProject);
      repositoryMock.update.mockResolvedValue(undefined);
      const dto: UpdateProjectDto = { name: 'Updated Project' };
      const result = await service.updateProject('uuid-1234', dto);
      expect(result.name).toBe(dto.name);
      expect(repositoryMock.update).toHaveBeenCalledWith('uuid-1234', dto);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);
      await expect(service.updateProject('uuid-1234', { name: 'x' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // #===========================#
  // # ==> GET PROJECT BY ID <== #
  // #===========================#
  describe('getProjectById', () => {
    it('should return project if exists', async () => {
      repositoryMock.findOne.mockResolvedValue(mockProject);
      const result = await service.getProjectById('uuid-1234');
      expect(result).toEqual(mockProject);
      expect(repositoryMock.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not exists', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);
      await expect(service.getProjectById('uuid-1234')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // #================================#
  // # ==> GET PAGINATED PROJECTS <== #
  // #================================#
  describe('getPaginatedProjects', () => {
    it('should return paginated projects', async () => {
      const paginated = new PaginatedResponseDto({
        args: { page: 1, take: 10 } as GetProjectsPaginatedDto,
        total: 1,
        records: [mockProject],
      });

      jest.spyOn(service, 'getPaginatedRecords').mockResolvedValue(paginated);
      const query: GetProjectsPaginatedDto = {
        page: 1,
        take: 10,
        userId: '',
      };
      const result = await service.getPaginatedProjects(query);
      expect(result).toEqual(paginated);
    });
  });

  // #=============================#
  // # ==> ADD USER TO PROJECT <== #
  // #=============================#
  describe('addUserToProject', () => {
    it('should add user to project', async () => {
      userServiceMock.checkExist.mockResolvedValue(mockUser);
      repositoryMock.findOne.mockResolvedValue({ ...mockProject, users: [] });
      const result = await service.addUserToProject('uuid-1234', 'user-123');
      expect(result.users).toContain(mockUser);
      expect(repositoryMock.createQueryBuilder().add).toHaveBeenCalledWith('user-123');
    });

    it('should throw ConflictException if user already added', async () => {
      userServiceMock.checkExist.mockResolvedValue(mockUser);
      repositoryMock.findOne.mockResolvedValue({ ...mockProject, users: [mockUser] });
      await expect(service.addUserToProject('uuid-1234', 'user-123')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  // #==================================#
  // # ==> REMOVE USER FROM PROJECT <== #
  // #==================================#
  describe('removeUserFromProject', () => {
    it('should remove user from project', async () => {
      userServiceMock.checkExist.mockResolvedValue(mockUser);
      repositoryMock.findOne.mockResolvedValue({ ...mockProject, users: [mockUser] });
      const result = await service.removeUserFromProject('uuid-1234', 'user-123');
      expect(result.users).not.toContain(mockUser);
      expect(repositoryMock.createQueryBuilder().remove).toHaveBeenCalledWith('user-123');
    });

    it("should throw BadRequestException if user isn't part of the project", async () => {
      userServiceMock.checkExist.mockResolvedValue(mockUser);
      repositoryMock.findOne.mockResolvedValue({ ...mockProject, users: [] });
      await expect(service.removeUserFromProject('uuid-1234', 'user-123')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  // #==============================#
  // # ==> DELETE PROJECT BY ID <== #
  // #==============================#
  describe('deleteProjectById', () => {
    it('should delete project', async () => {
      repositoryMock.findOne.mockResolvedValue(mockProject);
      repositoryMock.delete.mockResolvedValue(undefined);
      const result: DeleteRecordResponseDto = await service.deleteProjectById('uuid-1234');
      expect(result.deleted).toBe(true);
      expect(result.message).toBe('Project deleted successfully');
    });

    it('should throw NotFoundException if project not exists', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);
      await expect(service.deleteProjectById('uuid-1234')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
