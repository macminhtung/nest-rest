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

    // Create new product
    const newProduct = await this.repository.save(payload);

    // Create index for the new product
    await this.searchProductService.createIndex(newProduct);

    return newProduct;
  }

  // #========================#
  // # ==> UPDATE PRODUCT <== #
  // #========================#
  async updateProduct(id: string, payload: CreateProductDto) {
    // Check the product already exists
    const existedProduct = await this.checkExist({ where: { id } });

    // Check conflict the product name
    await this.checkConflict({ where: { name: payload.name, id: Not(id) } });

    // Update product
    await this.repository.update(id, payload);

    // Identify the updated product
    const updatedProduct = { ...existedProduct, ...payload };

    // Update index for the new product
    await this.searchProductService.createIndex(updatedProduct);

    return updatedProduct;
  }

  // #========================#
  // # ==> DELETE PRODUCT <== #
  // #========================#
  async deleteProduct(id: string) {
    // Check the product already exists
    await this.checkExist({ where: { id } });

    // Delete product
    await this.repository.delete(id);

    // Delete index for the product
    await this.searchProductService.deleteIndex(id);

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

    const paginationData = await this.getPaginatedRecords(restParams, () => {
      // Filter based on productIds
      if (productIds.length)
        this.pagingQueryBuilder.andWhere(`${this.entityName}.id IN (:...productIds)`, {
          productIds,
        });
    });

    return paginationData;
  }
}
