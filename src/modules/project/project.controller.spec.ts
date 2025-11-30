import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { DeleteRecordResponseDto, PaginatedResponseDto } from '@/common/dtos';
import { ProjectController } from '@/modules/project/project.controller';
import { ProjectService } from '@/modules/project/project.service';
import { ProjectEntity } from '@/modules/project/project.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddUserToProjectDto,
  GetProjectsPaginatedDto,
} from '@/modules/project/dtos';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProject: ProjectEntity = {
    id: 'uuid-1234',
    name: 'Test Project',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  } as unknown as ProjectEntity;

  const mockPaginated = new PaginatedResponseDto({
    args: { page: 1, take: 10 } as GetProjectsPaginatedDto,
    total: 1,
    records: [mockProject],
  });

  const mockService = {
    createProject: jest.fn().mockResolvedValue(mockProject),
    updateProject: jest.fn().mockResolvedValue(mockProject),
    getProjectById: jest.fn().mockResolvedValue(mockProject),
    getPaginatedProjects: jest.fn().mockResolvedValue(mockPaginated),
    addUserToProject: jest.fn().mockResolvedValue(mockProject),
    removeUserFromProject: jest.fn().mockResolvedValue(mockProject),
    deleteProjectById: jest.fn().mockResolvedValue({
      deleted: true,
      message: 'Project deleted successfully',
    } as DeleteRecordResponseDto),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{ provide: ProjectService, useValue: mockService }],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // #========================#
  // # ==> CREATE PROJECT <== #
  // #========================#
  describe('createProject', () => {
    it('should create a project', async () => {
      const dto: CreateProjectDto = { name: 'Test Project', description: 'Test Description' };
      const result = await controller.createProject(dto);
      expect(result).toEqual(mockProject);
      expect(service.createProject).toHaveBeenCalledWith(dto);
    });
  });

  // #========================#
  // # ==> UPDATE PROJECT <== #
  // #========================#
  describe('updateProject', () => {
    it('should update a project', async () => {
      const dto: UpdateProjectDto = { name: 'Updated Project' };
      const result = await controller.updateProject('uuid-1234', dto);
      expect(result).toEqual(mockProject);
      expect(service.updateProject).toHaveBeenCalledWith('uuid-1234', dto);
    });
  });

  // #===========================#
  // # ==> GET PROJECT BY ID <== #
  // #===========================#
  describe('getProjectById', () => {
    it('should return a project by id', async () => {
      const result = await controller.getProjectById('uuid-1234');
      expect(result).toEqual(mockProject);
      expect(service.getProjectById).toHaveBeenCalledWith('uuid-1234');
    });
  });

  // #================================#
  // # ==> GET PAGINATED PROJECTS <== #
  // #================================#
  describe('getPaginatedprojects', () => {
    it('should return paginated projects', async () => {
      const queryParams: GetProjectsPaginatedDto = {
        page: 1,
        take: 10,
        keySearch: 'projectName',
        userId: 'user-123',
      };
      const mockProjects = [mockProject] as ProjectEntity[];

      const paginatedResponse = new PaginatedResponseDto<ProjectEntity>({
        args: queryParams,
        total: mockProjects.length,
        records: mockProjects,
      });

      mockService.getPaginatedProjects.mockResolvedValue(paginatedResponse);

      const result = await controller.getPaginatedProjects(queryParams);
      expect(result).toEqual(mockPaginated);
      expect(service.getPaginatedProjects).toHaveBeenCalledWith(queryParams);
      expect(result.records).toHaveLength(1);
      expect(result.records[0]).toEqual(mockProject);
      expect(result.page).toBe(1);
      expect(result.take).toBe(10);
      expect(result.total).toBe(1);
    });
  });

  // #=============================#
  // # ==> ADD USER TO PROJECT <== #
  // #=============================#
  describe('addUserToProject', () => {
    it('should add user to project', async () => {
      const dto: AddUserToProjectDto = { userId: 'user-123' };
      const result = await controller.addUserToProject('uuid-1234', dto);
      expect(result).toEqual(mockProject);
      expect(service.addUserToProject).toHaveBeenCalledWith('uuid-1234', 'user-123');
    });

    it('should throw ConflictException if user already added', async () => {
      jest.spyOn(service, 'addUserToProject').mockRejectedValueOnce(new ConflictException());
      const dto: AddUserToProjectDto = { userId: 'user-123' };
      await expect(controller.addUserToProject('uuid-1234', dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  // #==================================#
  // # ==> REMOVE USER FROM PROJECT <== #
  // #==================================#
  describe('removeUserFromProject', () => {
    it('should remove user from project', async () => {
      const result = await controller.removeUserFromProject('uuid-1234', 'user-123');
      expect(result).toEqual(mockProject);
      expect(service.removeUserFromProject).toHaveBeenCalledWith('uuid-1234', 'user-123');
    });

    it('should throw BadRequestException if user not in project', async () => {
      jest.spyOn(service, 'removeUserFromProject').mockRejectedValueOnce(new BadRequestException());
      await expect(
        controller.removeUserFromProject('uuid-1234', 'user-123'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // #==============================#
  // # ==> DELETE PROJECT BY ID <== #
  // #==============================#
  describe('deleteProjectById', () => {
    it('should delete a project', async () => {
      const result = await controller.deleteProjectById('uuid-1234');
      expect(result).toEqual({
        deleted: true,
        message: 'Project deleted successfully',
      });
      expect(service.deleteProjectById).toHaveBeenCalledWith('uuid-1234');
    });
  });
});
