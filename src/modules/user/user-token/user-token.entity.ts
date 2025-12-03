import { Column, PrimaryColumn, Entity, ManyToOne, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName, ETokenType } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: ETableName.USER_TOKEN })
@Index(['userId', 'type', 'hashToken'])
export class UserTokenEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  hashToken: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: ETokenType })
  type: ETokenType;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true, unique: true })
  refreshTokenId?: string;

  // ==> [RELATION] COLUMNS <==
  @ApiProperty()
  @Column({ type: 'uuid' })
  userId: string;

  // ==> [RELATION] TABLES <==
  @ApiPropertyOptional()
  @ManyToOne(() => UserEntity)
  user: UserEntity;
}
