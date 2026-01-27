import { Column, PrimaryColumn, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { UserEntity } from '@/modules/user/user.entity';

export type TCheckoutProduct = {
  id: string;
  image: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

export enum ECheckoutCartStatus {
  FAILED = 'FAILED',
  PAID = 'PAID',
  WAITING_3DS = 'WAITING_3DS',
}

@Entity({ name: ETableName.CHECKOUT_CART })
export class CheckoutCartEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @ApiProperty()
  @Column({ enum: ECheckoutCartStatus })
  status: ECheckoutCartStatus;

  @ApiProperty()
  @Column({ type: 'jsonb', default: [] })
  products: TCheckoutProduct[];

  @ApiProperty()
  @Column()
  paymentIntentId: string;

  @ApiProperty()
  @Column({ nullable: true })
  clientSecret: string; // Use for case WAITING_3DS

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
}
