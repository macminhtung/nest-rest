import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { EEntity, ERoleName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';

@Entity({ tableName: EEntity.ROLE })
export class RoleEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryKey({ type: 'int4' })
  id: string;

  @ApiProperty()
  @Enum({ type: 'enum', items: () => ERoleName })
  name: ERoleName;

  @ApiProperty()
  @Property({ nullable: true })
  description: string;
}
