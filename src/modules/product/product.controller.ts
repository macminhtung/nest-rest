import { Controller, Get, Query, Body } from '@nestjs/common';
import { EEntity } from '@/common/enums';
import { Public } from '@/decorators';
import { ApiOkResponsePaginated, GetPaginatedRecordsDto } from '@/common/dtos';
import { ProductService } from '@/modules/product/product.service';
import { ProductEntity } from '@/modules/product/product.entity';

@Controller(EEntity.PRODUCT)
export class ProductController {
  constructor(private readonly userService: ProductService) {}

  // #================================#
  // # ==> GET PAGINATED PRODUCTS <== #
  // #================================#
  @Public()
  @ApiOkResponsePaginated(ProductEntity)
  @Get('/paginated')
  getPaginatedProducts(@Query() queryParams: GetPaginatedRecordsDto) {
    return this.userService.getPaginatedProducts(queryParams);
  }
}
