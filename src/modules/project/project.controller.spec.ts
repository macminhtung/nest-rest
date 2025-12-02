import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { DEFAULT_ROLES } from '@/common/constants';
import { PaginatedResponseDto, DeleteRecordResponseDto } from '@/common/dtos';
import { ProjectController } from '@/modules/project/project.controller';
import { ProjectService } from '@/modules/project/project.service';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserEntity } from '@/modules/user/user.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddUserToProjectDto,
  GetProjectsPaginatedDto,
} from '@/modules/project/dtos';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const initProject1: ProjectEntity = {
    id: 'uuid-1',
    name: 'Project 1',
    description: 'Description 1',
    createdAt: new Date(),
    users: [],
    tasks: [],
  };

  const initProject2: ProjectEntity = {
    id: 'uuid-2',
    name: 'Project2',
    description: 'Description 2',
    createdAt: new Date(),
    users: [],
    tasks: [],
  };

  const initUser: UserEntity = {
    id: 'uuid-user',
    email: 'user1@gmail.com',
    firstName: 'FirstName 1',
    lastName: 'LastName 1',
    location: 'Location 1',
    password: '',
    roleId: DEFAULT_ROLES.USER.id,
    createdAt: new Date(),
  };

  const mockService = {
    createProject: jest.fn(),
    updateProject: jest.fn(),
    getProjectById: jest.fn(),
    getPaginatedProjects: jest.fn(),
    addUserToProject: jest.fn(),
    removeUserFromProject: jest.fn(),
    deleteProjectById: jest.fn(),
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
    it('Should create a project', async () => {
      const createPayload: CreateProjectDto = {
        name: initProject1.name,
        description: initProject1.description,
      };

      mockService.createProject.mockResolvedValue(initProject1);
      const result = await controller.createProject(createPayload);

      expect(service.createProject).toHaveBeenCalledWith(createPayload);
      expect(result).toEqual(initProject1);
    });
  });

  // #========================#
  // # ==> UPDATE PROJECT <== #
  // #========================#
  describe('updateProject', () => {
    const updatePayload: UpdateProjectDto = { name: 'Updated Project' };

    it('Should update a project', async () => {
      const updatedProject = { ...initProject1, ...updatePayload };

      mockService.updateProject.mockResolvedValue(updatedProject);
      const result = await controller.updateProject(initProject1.id, updatePayload);

      expect(service.updateProject).toHaveBeenCalledWith(initProject1.id, updatePayload);
      expect(result).toEqual(updatedProject);
    });

    it('Should throw BadRequestException if sent invalid uuid', async () => {
      jest.spyOn(mockService, 'updateProject').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.updateProject('invalid-uuid', updatePayload)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('Should throw NotFoundException if the project does not exists', async () => {
      jest.spyOn(service, 'updateProject').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.updateProject(initProject1.id, updatePayload)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // #===========================#
  // # ==> GET PROJECT BY ID <== #
  // #===========================#
  describe('getProjectById', () => {
    it('Should return a project by id', async () => {
      mockService.getProjectById.mockResolvedValue(initProject1);
      const result = await controller.getProjectById(initProject1.id);

      expect(service.getProjectById).toHaveBeenCalledWith(initProject1.id);
      expect(result).toEqual(initProject1);
    });

    it('Should throw NotFoundException if the project does not exists', async () => {
      jest.spyOn(service, 'getProjectById').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getProjectById(initProject1.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // #================================#
  // # ==> GET PAGINATED PROJECTS <== #
  // #================================#
  describe('getPaginatedprojects', () => {
    it('Should return paginated projects', async () => {
      const queryParams: GetProjectsPaginatedDto = {
        page: 1,
        take: 10,
      };
      const projects: ProjectEntity[] = [initProject1, initProject2];
      const paginatedResponse = new PaginatedResponseDto<ProjectEntity>({
        args: queryParams,
        total: projects.length,
        records: projects,
      });

      mockService.getPaginatedProjects.mockResolvedValue(paginatedResponse);
      const result = await controller.getPaginatedProjects(queryParams);

      expect(service.getPaginatedProjects).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(paginatedResponse);
      expect(result.page).toBe(queryParams.page);
      expect(result.take).toBe(queryParams.take);
      expect(result.total).toBe(projects.length);
      expect(result.records.length).toBe(projects.length);
    });
  });

  // #=============================#
  // # ==> ADD USER TO PROJECT <== #
  // #=============================#
  describe('addUserToProject', () => {
    const addPayload: AddUserToProjectDto = { userId: initUser.id };

    it('Should add user to project', async () => {
      const addedProject = { ...initProject1, users: [initUser] };

      mockService.addUserToProject.mockResolvedValue(addedProject);
      const result = await controller.addUserToProject(initProject1.id, addPayload);

      expect(service.addUserToProject).toHaveBeenCalledWith(initProject1.id, initUser.id);
      expect(result).toEqual(addedProject);
    });

    it('should throw ConflictException if user already added', async () => {
      jest.spyOn(service, 'addUserToProject').mockRejectedValueOnce(new ConflictException());
      await expect(controller.addUserToProject(initUser.id, addPayload)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  // #==================================#
  // # ==> REMOVE USER FROM PROJECT <== #
  // #==================================#
  describe('removeUserFromProject', () => {
    it('Should remove user from project', async () => {
      mockService.removeUserFromProject.mockResolvedValue(initProject1);
      const result = await controller.removeUserFromProject(initProject1.id, initUser.id);

      expect(service.removeUserFromProject).toHaveBeenCalledWith(initProject1.id, initUser.id);
      expect(result).toEqual(initProject1);
    });

    it('Should throw BadRequestException if user not in project', async () => {
      jest.spyOn(service, 'removeUserFromProject').mockRejectedValueOnce(new BadRequestException());
      await expect(
        controller.removeUserFromProject(initProject1.id, initUser.id),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // #==============================#
  // # ==> DELETE PROJECT BY ID <== #
  // #==============================#
  describe('deleteProjectById', () => {
    it('Should delete a project', async () => {
      const deletedResponse: DeleteRecordResponseDto = {
        deleted: true,
        message: 'Project deleted successfully',
      };

      mockService.deleteProjectById.mockResolvedValue(deletedResponse);
      const result = await controller.deleteProjectById(initProject1.id);

      expect(service.deleteProjectById).toHaveBeenCalledWith(initProject1.id);
      expect(result).toEqual(deletedResponse);
    });

    it('Should throw NotFoundException if the project does not exists', async () => {
      jest.spyOn(service, 'deleteProjectById').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.deleteProjectById(initProject1.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
