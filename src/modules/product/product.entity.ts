import { Column, PrimaryColumn, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';

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
}
