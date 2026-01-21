import { Column, PrimaryColumn, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { UserEntity } from '@/modules/user/user.entity';

type TPaidProduct = {
  image: string;
  quantity: number;
  name: string;
  description: string;
  price: number;
};

@Entity({ name: ETableName.PAID_CART })
export class PaidCartEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @ApiProperty()
  @Column({ type: 'jsonb', default: [] })
  paidProducts: TPaidProduct[];

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
