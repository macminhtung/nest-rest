import {
  Repository,
  FindOneOptions,
  QueryRunner,
  SelectQueryBuilder,
  ObjectLiteral,
  DataSource,
} from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@/common/constants';
import { EOrder } from '@/common/enums';
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

@Injectable()
export class BaseService<E extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<E>) {
    this.entityName = this.repository.metadata.name;
  }

  @InjectDataSource()
  public readonly dataSource: DataSource;

  public readonly entityName: string;

  // #=====================#
  // # ==> TRANSACTION <== #
  // #=====================#
  async handleTransactionAndRelease<T>(payload: {
    queryRunner: QueryRunner;
    processFunc: () => Promise<T>;
    rollbackFunc?: () => Promise<unknown>;
  }): Promise<T> {
    const { queryRunner, processFunc, rollbackFunc } = payload;
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
      if (rollbackFunc) await rollbackFunc();

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
        message:
          errorMessage || `[${this.entityName.replace('Entity', '')}] ${ERROR_MESSAGES.NOT_FOUND}!`,
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
          errorMessage ||
          `[${this.entityName.replace('Entity', '')}] ${ERROR_MESSAGES.ALREADY_EXISTS}!`,
      });
  }

  // #===============================#
  // # ==> GET PAGINATED RECORDS <== #
  // #===============================#
  async getPaginatedRecords(
    args: GetPaginatedRecordsDto,
    customFilter?: (qb: SelectQueryBuilder<E>) => void,
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
    const qb = this.repository.createQueryBuilder(this.entityName);
    if (includeIds?.length) qb.whereInIds(includeIds);

    // Query records based on excludeIds
    if (excludeIds?.length)
      qb.andWhere(`${this.entityName}.id NOT IN (:...excludeIds)`, { excludeIds });

    // Query records based on createdFrom
    if (createdFrom) qb.andWhere(`${this.entityName}.createdAt >= :createdFrom`, { createdFrom });

    // Query records based on createdTo
    if (createdTo) qb.andWhere(`${this.entityName}.createdAt < :createdTo`, { createdTo });

    // Query deleted records
    if (isDeleted) qb.andWhere(`${this.entityName}.deletedAt IS NOT NULL`).withDeleted();

    // Run customFilter function
    customFilter && customFilter(qb);

    // Sort records via createdAt
    qb.addOrderBy(`${this.entityName}.createdAt`, order);

    // CASE: Select all records
    if (isSelectAll) qb.limit(NUM_LIMIT_RECORDS);
    // CASE: Select pagination records
    else qb.take(take).skip((page - 1) * take);

    const [entities, count] = await qb.getManyAndCount();
    return new PaginatedResponseDto<E>({ args, total: count, records: entities });
  }
}
