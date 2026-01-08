import { Column, PrimaryColumn, Entity, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';

@Entity({ name: ETableName.PRODUCT })
export class ProductEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  image: string;

  @ApiProperty()
  @Column({ unique: true, length: 100 })
  name: string;

  @ApiProperty()
  @Column({ length: 1000 })
  description: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  // ==> [RELATION] TABLES <==
  @ApiPropertyOptional()
  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, {
    cascade: ['remove', 'soft-remove'],
  })
  cartItems: CartItemEntity[];
}
