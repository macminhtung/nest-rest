import { Column, PrimaryColumn, Entity, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { RoleEntity } from '@/modules/user/role/role.entity';

@Entity({ name: ETableName.USER })
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty()
  @Column({ length: 40 })
  firstName: string;

  @ApiProperty()
  @Column({ length: 40 })
  lastName: string;

  @ApiProperty()
  @Column({ length: 200 })
  location: string;

  // Relation columns
  @ApiProperty({ type: 'integer' })
  @Column({ type: 'int2' })
  roleId: number;

  // Relation tables
  @ApiPropertyOptional()
  @ManyToOne(() => RoleEntity)
  role: RoleEntity;
}
