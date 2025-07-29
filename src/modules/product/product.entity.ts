import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EEntity } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';

@Entity({ name: EEntity.PRODUCT })
export class ProductEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
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
