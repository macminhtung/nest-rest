import { Column, PrimaryColumn, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EEntity, ERoleName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';

@Entity({ name: EEntity.ROLE })
export class RoleEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'int4' })
  id: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: ERoleName })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  description: string;
}
