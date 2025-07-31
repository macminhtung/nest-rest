import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EEntity } from '@/common/enums';
import { ProductEntity } from '@/modules/product/product.entity';

@Injectable()
export class SearchProductService {
  private readonly indexName = EEntity.PRODUCT;

  constructor(private readonly service: ElasticsearchService) {}

  // #======================#
  // # ==> CREATE INDEX <== #
  // #======================#
  async createIndex(product: ProductEntity) {
    const { id, name, description } = product;
    return await this.service.index({ index: this.indexName, id, document: { name, description } });
  }

  // #======================#
  // # ==> DELETE INDEX <== #
  // #======================#
  async deleteIndex(id: string) {
    return await this.service.delete({ index: this.indexName, id });
  }

  // #================#
  // # ==> SEARCH <== #
  // #================#
  async search(keySearch: string) {
    const { hits } = await this.service.search<ProductEntity>({
      index: this.indexName,
      query: { multi_match: { query: keySearch, fields: ['name', 'description'] } },
    });

    return hits.hits.map((hit) => ({ id: hit._id, ...hit._source }));
  }
}
