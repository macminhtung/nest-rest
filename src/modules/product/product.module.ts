import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from '@/modules/product/product.controller';
import { ProductService } from '@/modules/product/product.service';
import { ProductEntity } from '@/modules/product/product.entity';
import { ElasticModule } from '@/modules/elastic/elastic.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), ElasticModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
