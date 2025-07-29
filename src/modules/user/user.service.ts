import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base.service';
import { UserEntity } from '@/modules/user/user.entity';
import { UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  async updateUser(id: string, payload: UpdateUserDto) {
    const user = await this.repository.save({ id, ...payload });
    return user;
  }

  // #==================#
  // # ==> GET USER <== #
  // #==================#
  async getUser(id: string) {
    const existedUser = await this.checkExist({ where: { id }, relations: { role: true } });
    return existedUser;
  }

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  async getPaginatedUsers(queryParams: GetUsersPaginatedDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, () => {
      const { keySearch, roleIds } = queryParams;
      const alias = this.entityName;

      this.pagingQueryBuilder.leftJoinAndSelect(`${alias}.role`, 'role');

      // Filter based on roleIds
      if (roleIds?.length)
        this.pagingQueryBuilder.andWhere(`${alias}.roleId IN (:...roleIds)`, {
          roleIds,
        });

      // Query based on keySearch
      if (keySearch)
        this.pagingQueryBuilder.andWhere(
          `(${alias}.firstName ILIKE :keySearch
          OR ${alias}.lastName ILIKE :keySearch)`,
          { keySearch: `%${keySearch}%` },
        );
    });

    return paginationData;
  }
}
