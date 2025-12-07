import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { DEFAULT_ROLES } from '@/common/constants';
import { DeleteRecordResponseDto } from '@/common/dtos';
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

  randomPassword(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  // #================================#
  // # ==> GENERATE HASH PASSWORD <== #
  // #================================#
  async generateHashPassword(password: string): Promise<string> {
    const hashPassword = await hash(password, 10);
    return hashPassword;
  }

  // #===============================#
  // # ==> COMPARE HASH PASSWORD <== #
  // #===============================#
  async compareHashPassword(payload: { password: string; hashPassword: string }): Promise<boolean> {
    const { password, hashPassword } = payload;
    return await compare(password, hashPassword);
  }

  async createUser(payload: CreateUserDto): Promise<UserEntity> {
    const { email } = payload;
    // Prevent creating if email has conflict
    await this.checkConflict({ where: { email } });

    // Hash the password
    const temporaryPassword = this.randomPassword(); // TODO: ==> Send the temporaryPassword via email
    const hashPassword = await this.generateHashPassword(temporaryPassword);

    // Create newUser
    const newUser = await this.repository.save({
      id: uuidv7(),
      ...payload,
      password: hashPassword,
      roleId: DEFAULT_ROLES.USER.id,
    });

    return newUser;
  }

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  async updateUser(id: string, payload: UpdateUserDto) {
    const user = await this.repository.save({ id, ...payload });
    return user;
  }

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  async getUserById(id: string) {
    const existedUser = await this.checkExist({ where: { id }, relations: { role: true } });
    return existedUser;
  }

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  async getPaginatedUsers(queryParams: GetUsersPaginatedDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, (qb) => {
      const { keySearch, roleIds } = queryParams;
      const alias = this.entityName;

      qb.leftJoinAndSelect(`${alias}.role`, 'role');

      // Filter based on roleIds
      if (roleIds?.length) qb.andWhere(`${alias}.roleId IN (:...roleIds)`, { roleIds });

      // Query based on keySearch
      if (keySearch)
        qb.andWhere(`(${alias}.firstName ILIKE :keySearch OR ${alias}.lastName ILIKE :keySearch)`, {
          keySearch: `%${keySearch}%`,
        });
    });

    return paginationData;
  }

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  async deleteUserById(authUser: UserEntity, id: string): Promise<DeleteRecordResponseDto> {
    // Prevent delete yourself
    if (authUser.id === id) throw new BadRequestException({ message: 'Can not delete yourself' });

    // Check the user already exists
    await this.checkExist({ where: { id } });

    // Delete the user
    await this.repository.delete(id);

    return { deleted: true, message: 'User deleted successfully' };
  }
}
