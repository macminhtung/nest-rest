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
      const payload: CreateUserDto = { email: 'test@test.com', firstName: 'John', lastName: 'Doe' };

      jest.spyOn(service, 'checkConflict' as any).mockResolvedValue(undefined);

      mockUserRepository.save.mockResolvedValue({
        id: 'uuid',
        ...payload,
        roleId: DEFAULT_ROLES.USER.id,
        password: '',
      });

      const result = await service.createUser(payload);

      expect(service.checkConflict).toHaveBeenCalledWith({ where: { email: payload.email } });
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(payload.email);
    });
  });

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  describe('updateUser', () => {
    it('should update existing user', async () => {
      const id = 'uuid';
      const payload: UpdateUserDto = { firstName: 'Updated' };
      const existedUser = {
        id,
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
      } as UserEntity;

      jest.spyOn(service, 'checkExist' as any).mockResolvedValue(existedUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await service.updateUser(id, payload);

      expect(service.checkExist).toHaveBeenCalledWith({ where: { id } });
      expect(mockUserRepository.update).toHaveBeenCalledWith(id, payload);
      expect(result.firstName).toBe(payload.firstName);
    });
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  describe('getUserById', () => {
    it('should return user by id', async () => {
      const id = 'uuid';
      const user = { id, email: 'test@test.com' };
      mockUserRepository.findOne.mockResolvedValue(user as any);

      const result = await service.getUserById(id);
      expect(result).toEqual(user);
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
    it('should throw if user deletes self', async () => {
      const authUser = { id: 'uuid' } as UserEntity;

      await expect(service.deleteUserById(authUser, 'uuid')).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should delete other user successfully', async () => {
      const authUser = { id: 'authId' } as UserEntity;

      jest.spyOn(service, 'checkExist' as any).mockResolvedValue({ id: 'uuid' } as UserEntity);
      mockUserRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteUserById(authUser, 'uuid');
      expect(result).toEqual({ deleted: true, message: 'User deleted successfully' });
    });
  });
});
