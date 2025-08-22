import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BaseService } from '@/common/base.service';
import { GetPaginatedRecordsDto } from '@/common/dtos';
import { ProductEntity } from '@/modules/product/product.entity';
import { SearchProductService } from '@/modules/elastic/search-services';
import { CreateProductDto } from '@/modules/product/dtos';

@Injectable()
export class ProductService extends BaseService<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    public readonly repository: Repository<ProductEntity>,

    private readonly searchProductService: SearchProductService,
  ) {
    super(repository);
  }

  // #========================#
  // # ==> CREATE PRODUCT <== #
  // #========================#
  async createProduct(payload: CreateProductDto) {
    // Check conflict the product name
    await this.checkConflict({ where: { name: payload.name } });

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    const resData = await this.handleTransactionAndRelease(
      queryRunner,

      // Process function
      async () => {
        // Create new product
        const newProduct = await queryRunner.manager.save(ProductEntity, payload);

        // Create index for the new product
        await this.searchProductService.index(newProduct);

        return newProduct;
      },
    );

    return resData;
  }

  // #========================#
  // # ==> UPDATE PRODUCT <== #
  // #========================#
  async updateProduct(id: string, payload: CreateProductDto) {
    // Check the product already exists
    const existedProduct = await this.checkExist({ where: { id } });

    // Check conflict the product name
    await this.checkConflict({ where: { name: payload.name, id: Not(id) } });

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await this.handleTransactionAndRelease(
      queryRunner,

      // Process function
      async () => {
        // Update product
        await queryRunner.manager.update(ProductEntity, id, payload);

        // Update index for the new product
        await this.searchProductService.index({ id, ...payload });
      },
    );

    return { ...existedProduct, ...payload };
  }

  // #========================#
  // # ==> DELETE PRODUCT <== #
  // #========================#
  async deleteProduct(id: string) {
    // Check the product already exists
    await this.checkExist({ where: { id } });

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await this.handleTransactionAndRelease(
      queryRunner,

      // Process function
      async () => {
        // Delete product
        await queryRunner.manager.delete(ProductEntity, id);

        // Delete index for the product
        await this.searchProductService.delete(id);
      },
    );

    return id;
  }

  // #================================#
  // # ==> GET PAGINATED PRODUCTS <== #
  // #================================#
  async getPaginatedProducts(queryParams: GetPaginatedRecordsDto) {
    const { keySearch, ...restParams } = queryParams;
    let productIds: string[] = [];

    // Search based on keySearch
    if (keySearch) {
      const items = await this.searchProductService.search(keySearch);
      productIds = items.map((i) => i.id!);
    }

    const paginationData = await this.getPaginatedRecords(restParams, (qb) => {
      // Filter based on productIds [ElasticSearch]
      if (productIds.length) {
        qb.andWhere(`${this.entityName}.id IN (:...productIds)`, { productIds });
      }

      // Filter based on keySearch
      else if (keySearch) qb.andWhere(`${this.entityName}.name = :keySearch`, { keySearch });
    });

    return paginationData;
  }
}
