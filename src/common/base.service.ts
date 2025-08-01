import {
  Repository,
  FindOneOptions,
  QueryRunner,
  SelectQueryBuilder,
  ObjectLiteral,
  DataSource,
} from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  GetPaginatedRecordsDto,
  DEFAULT_PAGE_NUM,
  DEFAULT_PAGE_TAKE,
  NUM_LIMIT_RECORDS,
  PaginatedResponseDto,
} from '@/common/dtos';
import { ERROR_MESSAGES } from '@/common/constants';
import { EOrder } from '@/common/enums';

@Injectable()
export class BaseService<E extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<E>) {
    this.entityName = this.repository.metadata.name;
  }
  public entityName: string;

  public pagingQueryBuilder: SelectQueryBuilder<E>;

  @InjectDataSource()
  public readonly dataSource: DataSource;

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
      const resData = await processFunc();

      // Commit transaction
      await queryRunner.commitTransaction();

      return resData;

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
  async checkExist(findOpts: FindOneOptions<E>, errorMessage?: string): Promise<E> {
    const existRecord = await this.repository.findOne(findOpts);

    // Throw error if the record doesn't exists
    if (!existRecord)
      throw new NotFoundException({
        message: errorMessage || `[${this.repository.metadata.name}] ${ERROR_MESSAGES.NOT_FOUND}!`,
      });

    return existRecord;
  }

  // #========================#
  // # ==> CHECK_CONFLICT <== #
  // #========================#
  async checkConflict(findOpts: FindOneOptions<E>, errorMessage?: string) {
    const existRecord = await this.repository.findOne(findOpts);

    // Throw error if the record exists
    if (existRecord)
      throw new ConflictException({
        message:
          errorMessage || `[${this.repository.metadata.name}] ${ERROR_MESSAGES.ALREADY_EXISTS}!`,
      });
  }

  // #===============================#
  // # ==> GET PAGINATED RECORDS <== #
  // #===============================#
  async getPaginatedRecords(
    args: GetPaginatedRecordsDto,
    customFilter?: () => void,
  ): Promise<PaginatedResponseDto<E>> {
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
    return new PaginatedResponseDto<E>({ args, total: count, records: entities });
  }
}
