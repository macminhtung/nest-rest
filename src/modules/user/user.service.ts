import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BaseService } from '@/common/base.service';
import { UserEntity } from '@/modules/user/user.entity';
import { UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: EntityRepository<UserEntity>,
  ) {
    super(repository);
  }

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  async updateUser(id: string, payload: UpdateUserDto) {
    const existedUser = await this.checkExist({ filter: { id } });
    await this.update({ filter: { id }, entityData: payload });
    return { ...existedUser, ...payload };
  }

  // #==================#
  // # ==> GET USER <== #
  // #==================#
  async getUser(id: string) {
    const existedUser = await this.checkExist({ filter: { id }, options: { populate: ['role'] } });
    return existedUser;
  }

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  async getPaginatedUsers(queryParams: GetUsersPaginatedDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, (qb) => {
      const { keySearch, roleIds } = queryParams;

      qb.leftJoinAndSelect(`${this.entityName}.role`, 'R');

      // Filter based on roleIds
      if (roleIds?.length) qb.andWhere({ roleId: { $in: roleIds } });

      // Filter based on keySearch
      if (keySearch) {
        qb.andWhere({
          $or: [
            { firstName: { $ilike: `%${keySearch}%` } },
            { lastName: { $ilike: `%${keySearch}%` } },
          ],
        });
      }
    });

    return paginationData;
  }
}
