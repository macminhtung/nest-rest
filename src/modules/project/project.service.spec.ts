import { ConflictException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DEFAULT_ROLES } from '@/common/constants';
import { ProjectService } from '@/modules/project/project.service';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { DeleteRecordResponseDto, PaginatedResponseDto } from '@/common/dtos';
import {
  CreateProjectDto,
  UpdateProjectDto,
  GetProjectsPaginatedDto,
} from '@/modules/project/dtos';

describe('ProjectService', () => {
  let service: ProjectService;

  const initProject1: ProjectEntity = {
    id: 'uuid-1',
    name: 'Project 1',
    description: 'Description 1',
    createdAt: new Date(),
  };

  const initProject2: ProjectEntity = {
    id: 'uuid-2',
    name: 'Project 2',
    description: 'Description 2',
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

  const queryBuilderMock = {
    relation: jest.fn().mockReturnThis(),
    of: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockProjectRepository = {
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
    getRepository: jest.fn().mockReturnValue(mockProjectRepository),
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getRepositoryToken(ProjectEntity), useValue: mockProjectRepository },
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
    it('Should create a new project', async () => {
      const createPayload: CreateProjectDto = {
        name: initProject1.name,
        description: initProject1.description,
      };

      mockProjectRepository.save.mockResolvedValue(initProject1);
      const result = await service.createProject(createPayload);

      expect(mockProjectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(createPayload),
      );
      expect(result).toEqual(initProject1);
    });
  });

  // #========================#
  // # ==> UPDATE PROJECT <== #
  // #========================#
  describe('updateProject', () => {
    it('Should update and return a project', async () => {
      const updatePayload: UpdateProjectDto = { name: 'Updated Project' };

      jest.spyOn(service, 'checkExist').mockResolvedValue(initProject1);
      mockProjectRepository.update.mockResolvedValue(undefined);
      const result = await service.updateProject(initProject1.id, updatePayload);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id: initProject1.id } });
      expect(mockProjectRepository.update).toHaveBeenCalledWith(initProject1.id, updatePayload);
      expect(result).toEqual({ ...initProject1, ...updatePayload });
    });
  });

  // #===========================#
  // # ==> GET PROJECT BY ID <== #
  // #===========================#
  describe('getProjectById', () => {
    it('Should return project', async () => {
      const loadUser = true;
      jest.spyOn(service, 'checkExist').mockResolvedValue(initProject1);
      const result = await service.getProjectById(initProject1.id, loadUser);

      expect(service.checkExist).toHaveBeenCalledWith({
        where: { id: initProject1.id },
        relations: { users: loadUser },
      });
      expect(result).toEqual(initProject1);
    });
  });

  // #================================#
  // # ==> GET PAGINATED PROJECTS <== #
  // #================================#
  describe('getPaginatedProjects', () => {
    it('should return paginated projects', async () => {
      const queryParams: GetProjectsPaginatedDto = {
        page: 1,
        take: 10,
      };
      const projects = [initProject1, initProject2];

      const qbMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([projects, projects.length]),
      };

      mockProjectRepository.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.getPaginatedProjects(queryParams);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(qbMock.take).toHaveBeenCalledWith(queryParams.take);
      expect(qbMock.skip).toHaveBeenCalledWith(
        ((queryParams.page || 1) - 1) * (queryParams.take || 30),
      );
      expect(qbMock.addOrderBy).toHaveBeenCalled();
      expect(result.page).toEqual(queryParams.page);
      expect(result.take).toEqual(queryParams.take);
      expect(result.records).toEqual(projects);
    });
  });

  // #=============================#
  // # ==> ADD USER TO PROJECT <== #
  // #=============================#
  describe('addUserToProject', () => {
    describe('addUserToProject', () => {
      beforeEach(() => {
        mockProjectRepository.createQueryBuilder = jest.fn().mockReturnValue({
          relation: jest.fn().mockReturnValue({
            of: jest.fn().mockReturnThis(),
            add: jest.fn(),
          }),
        });
      });

      it('Should add user to project', async () => {
        userServiceMock.checkExist.mockResolvedValue(initUser);

        mockProjectRepository.findOne.mockResolvedValue({
          ...initProject1,
          users: [],
        });

        const result = await service.addUserToProject(initProject1.id, initUser.id);

        const qb = mockProjectRepository.createQueryBuilder();
        expect(qb.relation).toHaveBeenCalledWith(ProjectEntity, 'users');
        expect(qb.relation().of).toHaveBeenCalledWith(initProject1.id);
        expect(qb.relation().add).toHaveBeenCalledWith(initUser.id);
        expect(result.users).toContain(initUser);
      });
    });

    it('Should throw ConflictException if user already added', async () => {
      userServiceMock.checkExist.mockResolvedValue(initUser);
      mockProjectRepository.findOne.mockResolvedValue({ ...initProject1, users: [initUser] });
      await expect(service.addUserToProject(initProject1.id, initUser.id)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  // #==================================#
  // # ==> REMOVE USER FROM PROJECT <== #
  // #==================================#
  describe('removeUserFromProject', () => {
    beforeEach(() => {
      mockProjectRepository.createQueryBuilder = jest.fn().mockReturnValue({
        relation: jest.fn().mockReturnValue({
          of: jest.fn().mockReturnThis(),
          remove: jest.fn(),
        }),
      });
    });

    it('Should remove user from project', async () => {
      userServiceMock.checkExist.mockResolvedValue(initUser);
      mockProjectRepository.findOne.mockResolvedValue({
        ...initProject1,
        users: [initUser],
      });

      const result = await service.removeUserFromProject(initProject1.id, initUser.id);

      const qb = mockProjectRepository.createQueryBuilder();
      expect(qb.relation().remove).toHaveBeenCalledWith(initUser.id);
      expect(result.users).not.toContain(initUser);
    });

    it("Should throw BadRequestException if user isn't part of the project", async () => {
      userServiceMock.checkExist.mockResolvedValue(initUser);
      mockProjectRepository.findOne.mockResolvedValue({ ...initProject1, users: [] });
      await expect(
        service.removeUserFromProject(initProject1.id, initUser.id),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // #==============================#
  // # ==> DELETE PROJECT BY ID <== #
  // #==============================#
  describe('deleteProjectById', () => {
    it('Should delete project', async () => {
      const deletedResponse: DeleteRecordResponseDto = {
        deleted: true,
        message: 'Project deleted successfully',
      };

      mockProjectRepository.findOne.mockResolvedValue(initProject1);
      mockProjectRepository.delete.mockResolvedValue(undefined);
      const result: DeleteRecordResponseDto = await service.deleteProjectById(initProject1.id);

      expect(result).toEqual(deletedResponse);
    });
  });
});
