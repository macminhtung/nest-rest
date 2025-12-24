import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginatedResponseDto } from '@/common/dtos';
import { DEFAULT_ROLES } from '@/common/constants';
import { TRequest } from '@/common/types';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/user.entity';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';

describe('UserController', () => {
  let controller: UserController;

  const initAdminUser: UserEntity = {
    id: 'uuid-admin',
    email: 'admin@gmail.com',
    firstName: 'Admin',
    lastName: '',
    password: '',
    avatar: '',
    isEmailVerified: true,
    roleId: DEFAULT_ROLES.ADMIN.id,
    createdAt: new Date(),
  };
  const initUser1: UserEntity = {
    id: 'uuid-1',
    email: 'user1@gmail.com',
    firstName: 'FirstName 1',
    lastName: 'LastName 1',
    password: '',
    avatar: '',
    isEmailVerified: true,
    roleId: DEFAULT_ROLES.USER.id,
    createdAt: new Date(),
  };
  const initUser2: UserEntity = {
    id: 'uuid-2',
    email: 'user2@gmail.com',
    firstName: 'FirstName 2',
    lastName: 'LastName 2',
    password: '',
    avatar: '',
    isEmailVerified: true,
    roleId: DEFAULT_ROLES.USER.id,
    createdAt: new Date(),
  };

  const mockService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getUser: jest.fn(),
    getPaginatedUsers: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // #=====================#
  // # ==> CREATE USER <== #
  // #=====================#
  describe('createUser', () => {
    const createPayload: CreateUserDto = {
      email: initUser1.email,
      firstName: initUser1.firstName,
      lastName: initUser1.lastName,
      roleId: DEFAULT_ROLES.USER.id,
    };

    it('Should create user', async () => {
      mockService.createUser.mockResolvedValue(initUser1);
      const result = await controller.createUser(createPayload);

      expect(mockService.createUser).toHaveBeenCalledWith(createPayload);
      expect(result).toEqual(initUser1);
    });

    it('Should throw ConflictException if the email already exists', async () => {
      jest.spyOn(mockService, 'createUser').mockRejectedValueOnce(new ConflictException());
      await expect(controller.createUser(createPayload)).rejects.toBeInstanceOf(ConflictException);
    });

    it('Should throw BadRequestException if sent invalid email format', async () => {
      jest.spyOn(mockService, 'createUser').mockRejectedValueOnce(new BadRequestException());
      await expect(
        controller.createUser({ ...createPayload, email: 'invalid-email' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Should throw BadRequestException if sent invalid roleId', async () => {
      jest.spyOn(mockService, 'createUser').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.createUser({ ...createPayload, roleId: 10 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  describe('updateUser', () => {
    const updatePayload: UpdateUserDto = { firstName: 'FirstName updated' };

    it('Should update user', async () => {
      const updatedUser = { ...initUser1, ...updatePayload };

      mockService.updateUser.mockResolvedValue(updatedUser);
      const result = await controller.updateUser(initUser1.id, updatePayload);

      expect(mockService.updateUser).toHaveBeenCalledWith(initUser1.id, updatePayload);
      expect(result).toEqual(updatedUser);
    });

    it('Should throw BadRequestException if sent invalid uuid', async () => {
      jest.spyOn(mockService, 'updateUser').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.updateUser('invalid-uuid', updatePayload)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('Should throw BadRequestException if sent invalid roleId', async () => {
      jest.spyOn(mockService, 'updateUser').mockRejectedValueOnce(new BadRequestException());
      await expect(
        controller.updateUser('invalid-uuid', { ...updatePayload, roleId: 10 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Should throw NotFoundException if the user does not exists', async () => {
      jest.spyOn(mockService, 'updateUser').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.updateUser('nonexistent-uuid', updatePayload)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  describe('getUser', () => {
    it('Should get user by id', async () => {
      mockService.getUser.mockResolvedValue(initUser1);
      const result = await controller.getUser(initUser1.id);

      expect(result).toEqual(initUser1);
    });

    it('Should throw BadRequestException if sent invalid uuid', async () => {
      jest.spyOn(mockService, 'getUser').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.getUser('invalid-uuid')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Should throw NotFoundException if the user does not exists', async () => {
      jest.spyOn(mockService, 'getUser').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getUser(initUser1.id)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  describe('getPaginatedUsers', () => {
    it('Should return paginated users', async () => {
      const queryParams: GetUsersPaginatedDto = { page: 1, take: 10, roleIds: [] };
      const users: UserEntity[] = [initUser1, initUser2];
      const paginatedResponse = new PaginatedResponseDto<UserEntity>({
        args: queryParams,
        total: users.length,
        records: users,
      });

      mockService.getPaginatedUsers.mockResolvedValue(paginatedResponse);
      const result = await controller.getPaginatedUsers(queryParams);

      expect(mockService.getPaginatedUsers).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(paginatedResponse);
    });
  });

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  describe('deleteUser', () => {
    const req = { authUser: initAdminUser } as unknown as TRequest;

    it('Should delete user by id', async () => {
      mockService.deleteUser.mockResolvedValue(initUser1.id);
      const result = await controller.deleteUser(req, initUser1.id);

      expect(mockService.deleteUser).toHaveBeenCalledWith(req.authUser, initUser1.id);
      expect(result).toBe(initUser1.id);
    });

    it('Should throw NotFoundException if the user does not exists', async () => {
      jest.spyOn(mockService, 'deleteUser').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.deleteUser(req, 'nonexistent-uuid')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Should throw BadRequestException if sent invalid uuid', async () => {
      jest.spyOn(mockService, 'deleteUser').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.deleteUser(req, 'invalid-uuid')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('Should throw BadRequestException if user deletes self', async () => {
      jest.spyOn(mockService, 'deleteUser').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.deleteUser(req, req.authUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
