import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { DEFAULT_ROLES } from '@/common/constants';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';
import { EBoolean, EOrder } from '@/common/enums';
import { PaginatedResponseDto } from '@/common/dtos';

describe('UserService', () => {
  let service: UserService;

  // Mock repository
  const mockUserRepository = {
    metadata: { name: 'UserEntity' },
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  // Mock DataSource (BaseService có thể dùng)
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
    it('should create a new user', async () => {
      const payload: CreateUserDto = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        location: 'Location',
      };

      jest.spyOn(service, 'checkConflict').mockResolvedValue(undefined);

      mockUserRepository.save.mockResolvedValue({
        id: 'uuid',
        ...payload,
        password: '',
        roleId: DEFAULT_ROLES.USER.id,
      });

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
    it('should update existing user', async () => {
      const id = 'uuid';
      const payload: UpdateUserDto = { firstName: 'Update firstName', location: 'Update Location' };
      const existedUser: UserEntity = {
        id,
        firstName: 'John',
        lastName: 'Doe',
        location: '',
        email: '',
        password: '',
        roleId: DEFAULT_ROLES.USER.id,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'checkExist').mockResolvedValue(existedUser);
      mockUserRepository.update.mockResolvedValue(undefined);
      const result = await service.updateUser(id, payload);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id } });
      expect(mockUserRepository.update).toHaveBeenCalledWith(id, payload);
      expect(result.id).toBe(existedUser.id);
      expect(result.email).toBe(existedUser.email);
      expect(result.firstName).toBe(payload.firstName);
      expect(result.lastName).toBe(existedUser.lastName);
      expect(result.location).toBe(payload.location);
      expect(result.roleId).toBe(existedUser.roleId);
      expect(result.createdAt).toBe(existedUser.createdAt);
    });
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  describe('getUserById', () => {
    it('should return user by id', async () => {
      const id = 'uuid';
      const existedUser: UserEntity = {
        id,
        firstName: 'John',
        lastName: 'Doe',
        location: '',
        email: '',
        password: '',
        roleId: DEFAULT_ROLES.USER.id,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'checkExist').mockResolvedValue(existedUser);
      const result = await service.getUserById(id);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id } });
      expect(result.id).toBe(existedUser.id);
      expect(result.email).toBe(existedUser.email);
      expect(result.firstName).toBe(existedUser.firstName);
      expect(result.lastName).toBe(existedUser.lastName);
      expect(result.location).toBe(existedUser.location);
      expect(result.roleId).toBe(existedUser.roleId);
      expect(result.createdAt).toBe(existedUser.createdAt);
    });
  });

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  describe('getPaginatedUsers', () => {
    it('should return paginated users wrapped in PaginatedResponseDto', async () => {
      const args: GetUsersPaginatedDto = {
        page: 1,
        take: 30,
        order: EOrder.ASC,
        isSelectAll: EBoolean.FALSE,
      };

      const users = [{ id: 'uuid1' }, { id: 'uuid2' }];
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
      const result = await service.getPaginatedUsers(args);

      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.records).toEqual(users);
      expect(qbMock.addOrderBy).toHaveBeenCalled();
      expect(qbMock.take).toHaveBeenCalledWith(args.take);
      expect(qbMock.skip).toHaveBeenCalledWith(((args.page || 1) - 1) * (args.take || 30));
    });
  });

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  describe('deleteUserById', () => {
    const authUser: UserEntity = {
      id: 'uuid-admin',
      firstName: 'Admin',
      lastName: '',
      location: '',
      email: '',
      password: '',
      roleId: DEFAULT_ROLES.ADMIN.id,
      createdAt: new Date(),
    };

    it('should throw if user deletes self', async () => {
      const authUser: UserEntity = {
        id: 'uuid-admin',
        firstName: 'Admin',
        lastName: '',
        location: '',
        email: '',
        password: '',
        roleId: DEFAULT_ROLES.USER.id,
        createdAt: new Date(),
      };

      await expect(service.deleteUserById(authUser, 'uuid-admin')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete other user successfully', async () => {
      const user: UserEntity = {
        id: 'uuid-user',
        firstName: 'User',
        lastName: '',
        location: '',
        email: '',
        password: '',
        roleId: DEFAULT_ROLES.USER.id,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'checkExist').mockResolvedValue(user);
      mockUserRepository.delete.mockResolvedValue(undefined);
      const result = await service.deleteUserById(authUser, user.id);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id: user.id } });
      expect(result).toEqual({ deleted: true, message: 'User deleted successfully' });
    });
  });
});
