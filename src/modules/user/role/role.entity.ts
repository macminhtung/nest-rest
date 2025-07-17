import { Column, PrimaryColumn, Entity } from 'typeorm';
import { EEntity, ERoleName } from '@/common/enum';
import { BaseEntity } from '@/common/base.entity';

@Entity({ name: EEntity.ROLE })
export class RoleEntity extends BaseEntity {
  @PrimaryColumn({ type: 'int4' })
  id: string;

  @Column({ type: 'enum', enum: ERoleName })
  name: string;

  @Column({ nullable: true })
  description: string;
}
