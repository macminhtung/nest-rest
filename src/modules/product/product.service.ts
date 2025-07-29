import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base.service';
import { GetPaginatedRecordsDto } from '@/common/dtos';
import { ProductEntity } from '@/modules/product/product.entity';

@Injectable()
export class ProductService extends BaseService<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    public readonly repository: Repository<ProductEntity>,
  ) {
    super(repository);
  }

  // #================================#
  // # ==> GET PAGINATED PRODUCTS <== #
  // #================================#
  async getPaginatedProducts(queryParams: GetPaginatedRecordsDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, () => {
      const { keySearch } = queryParams;
      const alias = this.entityName;

      // Query based on keySearch
      if (keySearch)
        this.pagingQueryBuilder.andWhere(
          `(${alias}.name ILIKE :keySearch OR ${alias}.description ILIKE :keySearch)`,
          { keySearch: `%${keySearch}%` },
        );
    });

    return paginationData;
  }
}
