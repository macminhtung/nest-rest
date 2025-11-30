import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from './dtos';
import { DeleteRecordResponseDto, PaginatedResponseDto } from '@/common/dtos';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getUserById: jest.fn(),
    getPaginatedUsers: jest.fn(),
    deleteUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // #=====================#
  // # ==> CREATE USER <== #
  // #=====================#
  it('should create user', async () => {
    const payload: CreateUserDto = { email: 'a@b.com', firstName: 'John', lastName: 'Doe' };
    const user = { id: 'uuid', ...payload } as UserEntity;
    mockUserService.createUser.mockResolvedValue(user);

    const result = await controller.createUser(payload);
    expect(result).toEqual(user);
    expect(mockUserService.createUser).toHaveBeenCalledWith(payload);
  });

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  it('should update user', async () => {
    const payload: UpdateUserDto = { firstName: 'Updated' };
    const id = 'uuid';
    const user = { id, email: 'a@b.com', firstName: 'Updated' } as UserEntity;
    mockUserService.updateUser.mockResolvedValue(user);

    const result = await controller.updateUser(id, payload);
    expect(result).toEqual(user);
    expect(mockUserService.updateUser).toHaveBeenCalledWith(id, payload);
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  it('should get user by id', async () => {
    const id = 'uuid';
    const user = { id, email: 'a@b.com' } as UserEntity;
    mockUserService.getUserById.mockResolvedValue(user);

    const result = await controller.getUserById(id);
    expect(result).toEqual(user);
  });

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  describe('getPaginatedUsers', () => {
    it('should return paginated users wrapped in PaginatedResponseDto', async () => {
      const queryParams: GetUsersPaginatedDto = {
        page: 1,
        take: 10,
        keySearch: 'John',
        email: 'test@example.com',
        roleIds: [1],
      };

      const mockUsers: UserEntity[] = [
        { id: 'uuid1', email: 'a@b.com', firstName: 'John', lastName: 'Doe' } as UserEntity,
      ];

      const paginatedResponse = new PaginatedResponseDto<UserEntity>({
        args: queryParams,
        total: mockUsers.length,
        records: mockUsers,
      });

      mockUserService.getPaginatedUsers.mockResolvedValue(paginatedResponse);

      const result = await controller.getPaginatedUsers(queryParams);

      expect(mockUserService.getPaginatedUsers).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(paginatedResponse);
      expect(result.records).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  it('should delete user by id', async () => {
    const req = { authUser: { id: 'authId' } };
    const id = 'uuid';
    const response: DeleteRecordResponseDto = {
      deleted: true,
      message: 'User deleted successfully',
    };
    mockUserService.deleteUserById.mockResolvedValue(response);

    const result = await controller.deleteUserById(req as any, id);
    expect(result).toEqual(response);
    expect(mockUserService.deleteUserById).toHaveBeenCalledWith(req.authUser, id);
  });
});
