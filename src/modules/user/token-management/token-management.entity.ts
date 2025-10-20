import { Entity, PrimaryKey, Property, ManyToOne, Index, Enum } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EEntity, ETokenType } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ tableName: EEntity.TOKEN_MANAGEMENT })
@Index({ properties: ['userId', 'type', 'encryptedToken'] })
export class TokenManagementEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryKey({ type: 'uuid' })
  id: string;

  @ApiProperty()
  @Property()
  encryptedToken: string;

  @ApiProperty()
  @Enum({ type: 'enum', items: () => ETokenType })
  type: ETokenType;

  // Relation columns
  @ApiProperty()
  @Property({ type: 'uuid', persist: false })
  userId: string;

  // Relation tables
  @ApiPropertyOptional()
  @ManyToOne(() => UserEntity)
  user?: UserEntity;
}
