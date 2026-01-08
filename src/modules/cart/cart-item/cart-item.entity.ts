import { Column, PrimaryColumn, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { ProductEntity } from '@/modules/product/product.entity';
import { CartEntity } from '@/modules/cart/cart.entity';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: ETableName.CART_ITEM })
@Index('UQ_CART_ITEM_PER_PRODUCT_PER_CART', ['productId', 'cartId'], { unique: true })
export class CartItemEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  quantity: number;

  // ==> [RELATION] COLUMNS <==
  @ApiProperty()
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  cartId: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  checkoutUnitPrice: number;

  // ==> [RELATION] TABLES <==
  @ApiPropertyOptional()
  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ApiPropertyOptional()
  @ManyToOne(() => CartEntity)
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ApiPropertyOptional()
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
