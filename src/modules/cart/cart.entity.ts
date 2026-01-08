import { Column, PrimaryColumn, Entity, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { UserEntity } from '@/modules/user/user.entity';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';

export enum ECartStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  CHECKED_OUT = 'CHECKED_OUT',
}

@Index('UQ_ACTIVE_CART_PER_USER', ['userId'], {
  unique: true,
  where: `"status" = '${ECartStatus.ACTIVE}'`,
})
@Entity({ name: ETableName.CART })
export class CartEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @ApiProperty()
  @Column({ type: 'enum', enum: ECartStatus, default: ECartStatus.ACTIVE })
  status: ECartStatus;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  checkoutTotalPrice: number;

  // ==> [RELATION] COLUMNS <==
  @Index()
  @ApiProperty()
  @Column({ type: 'uuid' })
  userId: string;

  // ==> [RELATION] TABLES <==
  @ApiPropertyOptional()
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiPropertyOptional()
  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, {
    cascade: ['remove', 'soft-remove'],
  })
  cartItems: CartItemEntity[];
}
