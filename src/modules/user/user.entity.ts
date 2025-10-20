import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EEntity } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { RoleEntity } from '@/modules/user/role/role.entity';

@Entity({ tableName: EEntity.USER })
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryKey({ type: 'uuid' })
  id: string;

  @ApiProperty()
  @Property({ default: '' })
  avatar?: string;

  @ApiProperty()
  @Property({ unique: true })
  email: string;

  @Property({ hidden: true })
  password: string;

  @ApiProperty()
  @Property()
  @Index()
  firstName: string;

  @ApiProperty()
  @Property()
  @Index()
  lastName: string;

  @Property({ default: new Date().valueOf().toString() })
  passwordTimestamp: string; // ==> Check JWT after password change

  @ApiProperty()
  @Property({ default: false })
  isEmailVerified: boolean;

  // Relation columns
  @ApiProperty({ type: 'integer' })
  @Property({ type: 'int4', persist: false })
  @Index()
  roleId: number;

  // Relation tables
  @ApiPropertyOptional()
  @ManyToOne(() => RoleEntity)
  role?: RoleEntity;
}
