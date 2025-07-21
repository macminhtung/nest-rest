import {
  Repository,
  FindOneOptions,
  FindOptionsWhere,
  QueryRunner,
  SelectQueryBuilder,
  ObjectLiteral,
} from 'typeorm';
import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  GetRecordsPaginationDto,
  DEFAULT_PAGE_NUM,
  DEFAULT_PAGE_TAKE,
  NUM_LIMIT_RECORDS,
  PaginationResponseDto,
} from '@/common/dtos';
import { EOrder } from '@/common/enums';

@Injectable()
export class BaseService<E extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<E>) {
    this.entityName = this.repository.metadata.name;
  }
  public entityName: string;

  public pagingQueryBuilder: SelectQueryBuilder<E>;

  // #=====================#
  // # ==> TRANSACTION <== #
  // #=====================#
  async handleTransactionAndRelease<T>(
    queryRunner: QueryRunner,
    processFunc: () => Promise<T>,
    rollbackFunc?: () => void,
  ): Promise<T> {
    try {
      // Start transaction
      await queryRunner.startTransaction();

      // Run callback function
      const entity = await processFunc();

      return entity;

      // Rollback
    } catch (err) {
      // Rollback func
      if (rollbackFunc) rollbackFunc();

      throw new BadRequestException({ message: err.message });

      // Release the query runner
    } finally {
      await queryRunner.release();
    }
  }

  // #=====================#
  // # ==> CHECK_EXIST <== #
  // #=====================#
  async checkExist(
    options: FindOneOptions<E> | FindOptionsWhere<E>,
    expectNotFoundMessage?: string,
  ): Promise<E> {
    const existRecord =
      'where' in options
        ? await this.repository.findOne(options)
        : await this.repository.findOneBy(options as FindOptionsWhere<E>);

    // CASE: Expect the record not found
    if (expectNotFoundMessage) {
      if (existRecord)
        throw new ConflictException({
          message: expectNotFoundMessage,
        });
    }

    // CASE: Expect the record exist
    if (!existRecord)
      throw new NotFoundException({
        message: `[${this.repository.metadata.name.replace('Entity', '')}] Not found!`,
      });
    return existRecord;
  }

  // #====================#
  // # ==> PAGINATION <== #
  // #====================#
  async getPaginationByQuery(
    args: GetRecordsPaginationDto,
    customFilter?: () => void,
  ): Promise<PaginationResponseDto<E>> {
    const {
      isDeleted,
      createdFrom,
      createdTo,
      includeIds,
      excludeIds,
      isSelectAll,
      order = EOrder.DESC,
      page = DEFAULT_PAGE_NUM,
      take = DEFAULT_PAGE_TAKE,
    } = args;

    // Query records based on includeIds
    const queryBuilder = this.repository.createQueryBuilder(this.entityName);
    if (includeIds?.length) queryBuilder.whereInIds(includeIds);

    // Query records based on excludeIds
    if (excludeIds?.length)
      queryBuilder.andWhere(`${this.entityName}.id NOT IN (:...excludeIds)`, {
        excludeIds,
      });

    // Query records based on createdFrom
    if (createdFrom)
      queryBuilder.andWhere(`${this.entityName}.createdAt >= :createdFrom`, {
        createdFrom,
      });

    // Query records based on createdTo
    if (createdTo)
      queryBuilder.andWhere(`${this.entityName}.createdAt < :createdTo`, {
        createdTo,
      });

    // Query deleted records
    if (isDeleted) queryBuilder.andWhere(`${this.entityName}.deletedAt IS NOT NULL`).withDeleted();

    // NOTE: Must mapping queryBuilder into pagingQueryBuilder before run customFilter
    this.pagingQueryBuilder = queryBuilder;

    // Run customFilter function
    customFilter && customFilter();

    // Sort records via createdAt
    this.pagingQueryBuilder.addOrderBy(`${this.entityName}.createdAt`, order);

    // CASE: Select all records
    if (isSelectAll) this.pagingQueryBuilder.limit(NUM_LIMIT_RECORDS);
    // CASE: Select pagination records
    else this.pagingQueryBuilder.take(take).skip((page - 1) * take);

    const [entities, count] = await this.pagingQueryBuilder.getManyAndCount();
    return new PaginationResponseDto<E>({ args, total: count, data: entities });
  }
}
