import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { DEFAULT_ROLES } from '@/common/constants';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';
import { EOrder } from '@/common/enums';
import { DeleteRecordResponseDto, PaginatedResponseDto } from '@/common/dtos';

describe('UserService', () => {
  let service: UserService;

  const authUser: UserEntity = {
    id: 'uuid-admin',
    email: 'admin@gmail.com',
    firstName: 'Admin',
    lastName: '',
    location: '',
    password: '',
    roleId: DEFAULT_ROLES.ADMIN.id,
    createdAt: new Date(),
  };

  const initUser1: UserEntity = {
    id: 'uuid-1',
    email: 'user1@gmail.com',
    firstName: 'FirstName 1',
    lastName: 'LastName 1',
    location: 'Location 1',
    password: '',
    roleId: DEFAULT_ROLES.USER.id,
    createdAt: new Date(),
  };

  const initUser2: UserEntity = {
    id: 'uuid-2',
    email: 'user2@gmail.com',
    firstName: 'FirstName 2',
    lastName: 'LastName 2',
    location: 'Location 2',
    password: '',
    roleId: DEFAULT_ROLES.USER.id,
    createdAt: new Date(),
  };

  // Mock repository
  const mockUserRepository = {
    metadata: { name: 'UserEntity' },
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockUserRepository),
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // #=====================#
  // # ==> CREATE USER <== #
  // #=====================#
  describe('createUser', () => {
    it('Should create a new user', async () => {
      const payload: CreateUserDto = {
        email: initUser1.email,
        firstName: initUser1.firstName,
        lastName: initUser1.lastName,
        location: initUser1.location,
      };

      jest.spyOn(service, 'checkConflict').mockResolvedValue(undefined);
      mockUserRepository.save.mockResolvedValue(initUser1);
      const result = await service.createUser(payload);

      expect(service.checkConflict).toHaveBeenCalledWith({ where: { email: payload.email } });
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(payload.email);
      expect(result.firstName).toBe(payload.firstName);
      expect(result.lastName).toBe(payload.lastName);
      expect(result.location).toBe(payload.location);
      expect(result.roleId).toBe(DEFAULT_ROLES.USER.id);
    });
  });

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  describe('updateUser', () => {
    it('Should update existing user', async () => {
      const id = 'uuid';
      const updatePayload: UpdateUserDto = {
        firstName: 'Update firstName',
        location: 'Update Location',
      };
      jest.spyOn(service, 'checkExist').mockResolvedValue(initUser1);
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await service.updateUser(id, updatePayload);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id } });
      expect(mockUserRepository.update).toHaveBeenCalledWith(id, updatePayload);
      expect(result.firstName).toBe(updatePayload.firstName);
      expect(result.location).toBe(updatePayload.location);
      expect(result.id).toBe(initUser1.id);
      expect(result.email).toBe(initUser1.email);
      expect(result.lastName).toBe(initUser1.lastName);
      expect(result.roleId).toBe(initUser1.roleId);
      expect(result.createdAt).toBe(initUser1.createdAt);
    });
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  describe('getUserById', () => {
    it('Should return user by id', async () => {
      jest.spyOn(service, 'checkExist').mockResolvedValue(initUser1);
      const result = await service.getUserById(initUser1.id);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id: initUser1.id } });
      expect(result).toEqual(initUser1);
    });
  });

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  describe('getPaginatedUsers', () => {
    it('Should return paginated users wrapped in PaginatedResponseDto', async () => {
      const queryParams: GetUsersPaginatedDto = {
        page: 1,
        take: 30,
        order: EOrder.ASC,
      };

      const users = [initUser1, initUser2];
      const qbMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([users, users.length]),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(qbMock);
      const result = await service.getPaginatedUsers(queryParams);

      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(qbMock.take).toHaveBeenCalledWith(queryParams.take);
      expect(qbMock.skip).toHaveBeenCalledWith(
        ((queryParams.page || 1) - 1) * (queryParams.take || 30),
      );
      expect(qbMock.addOrderBy).toHaveBeenCalled();
      expect(result.page).toBe(queryParams.page);
      expect(result.take).toBe(queryParams.take);
      expect(result.records).toEqual(users);
    });
  });

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  describe('deleteUserById', () => {
    it('Should delete other user successfully', async () => {
      const deletedResponse: DeleteRecordResponseDto = {
        deleted: true,
        message: 'User deleted successfully',
      };

      jest.spyOn(service, 'checkExist').mockResolvedValue(initUser1);
      mockUserRepository.delete.mockResolvedValue(undefined);
      const result = await service.deleteUserById(authUser, initUser1.id);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id: initUser1.id } });
      expect(result).toEqual(deletedResponse);
    });
  });
});
