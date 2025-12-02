import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRecordResponseDto, PaginatedResponseDto } from '@/common/dtos';
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

  const mockService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getUserById: jest.fn(),
    getPaginatedUsers: jest.fn(),
    deleteUserById: jest.fn(),
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

    it('Should throw NotFoundException if the user does not exists', async () => {
      jest.spyOn(mockService, 'updateUser').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.updateUser(initUser1.id, updatePayload)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  describe('getUserById', () => {
    it('Should get user by id', async () => {
      mockService.getUserById.mockResolvedValue(initUser1);
      const result = await controller.getUserById(initUser1.id);

      expect(result).toEqual(initUser1);
    });

    it('Should throw NotFoundException if the user does not exists', async () => {
      jest.spyOn(mockService, 'getUserById').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getUserById(initUser1.id)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  describe('getPaginatedUsers', () => {
    it('Should return paginated users', async () => {
      const queryParams: GetUsersPaginatedDto = { page: 1, take: 10 };
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
  describe('getUserById', () => {
    const req = { authUser: initAdminUser } as unknown as TRequest;

    it('Should delete user by id', async () => {
      const response: DeleteRecordResponseDto = {
        deleted: true,
        message: 'User deleted successfully',
      };

      mockService.deleteUserById.mockResolvedValue(response);
      const result = await controller.deleteUserById(req, initUser1.id);

      expect(mockService.deleteUserById).toHaveBeenCalledWith(req.authUser, initUser1.id);
      expect(result).toEqual(response);
    });

    it('Should throw NotFoundException if the user does not exists', async () => {
      jest.spyOn(mockService, 'deleteUserById').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.deleteUserById(req, initUser1.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Should throw BadRequestException if user deletes self', async () => {
      jest.spyOn(mockService, 'deleteUserById').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.deleteUserById(req, req.authUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
