import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { DeleteRecordResponseDto } from '@/common/dtos';
import { ERROR_MESSAGES } from '@/common/constants';
import { BaseService } from '@/common/base.service';
import { UserEntity } from '@/modules/user/user.entity';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  /**
   * Creates a new user.
   * Checks for email conflicts before creation.
   * @param payload Data to create the user (CreateUserDto)
   * @returns The newly created UserEntity
   */
  async createUser(payload: CreateUserDto): Promise<UserEntity> {
    const { email } = payload;
    // Prevent creating if email has conflict
    await this.checkConflict({ where: { email } });

    // Create newUser
    const newUser = await this.repository.save({ id: uuidv7(), ...payload });

    return newUser;
  }

  /**
   * Updates an existing user by ID.
   * @param id UUID of the user to update
   * @param payload Update data (UpdateUserDto)
   * @returns The updated UserEntity
   */
  async updateUser(id: string, payload: UpdateUserDto): Promise<UserEntity> {
    // Check the user already exists
    await this.checkExist({ where: { id } });

    // Update the user
    const user = await this.repository.save({ id, ...payload });
    return user;
  }

  /**
   * Retrieves a user by ID, including its role relation.
   * @param id UUID of the user
   * @returns UserEntity or null if not found
   */
  async getUserById(id: string): Promise<UserEntity | null> {
    return await this.repository.findOne({ where: { id }, relations: { role: true } });
  }

  /**
   * Retrieves a paginated list of users with optional filtering and search.
   * Supports filtering by email, roleIds, and keySearch (firstName/lastName).
   * @param queryParams Pagination and filter parameters
   * @returns Paginated result object
   */
  async getPaginatedUsers(queryParams: GetUsersPaginatedDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, (qb) => {
      const { keySearch, email, roleIds = [] } = queryParams;
      const alias = this.entityName;

      qb.leftJoinAndSelect(`${alias}.role`, 'role');

      // Filter based on roleIds
      if (roleIds.length) qb.andWhere(`${alias}.roleId IN (:...roleIds)`, { roleIds });

      // Filter based on email
      if (email) qb.andWhere(`${alias}.email = :email`, { email });

      // Query based on keySearch
      if (keySearch)
        qb.andWhere(`(${alias}.firstName ILIKE :keySearch OR ${alias}.lastName ILIKE :keySearch)`, {
          keySearch: `%${keySearch}`,
        });
    });

    return paginationData;
  }

  /**
   * Deletes a user by ID.
   * Users are not allowed to delete themselves.
   * @param authUser The user performing the action
   * @param id UUID of the user to delete
   * @throws BadRequestException if trying to delete yourself
   */
  async deleteUserById(authUser: UserEntity, id: string): Promise<DeleteRecordResponseDto> {
    // Prevent delete yourself
    if (authUser.id === id)
      throw new BadRequestException({ message: ERROR_MESSAGES.CAN_NOT_DELETE_YOUR_SELF });

    // Check the user already exists
    await this.checkExist({ where: { id } });

    // Delete the user
    await this.repository.delete(id);

    return { deleted: true, message: 'User deleted successfully' };
  }
}
