import { Column, PrimaryColumn, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { RoleEntity } from '@/modules/user/role/role.entity';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';

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

  @ApiPropertyOptional()
  @Column({ length: 200, nullable: true })
  location: string;

  // Relation columns
  @ApiProperty({ type: 'integer' })
  @Column({ type: 'int2' })
  roleId: number;

  // Relation tables
  @ApiPropertyOptional()
  @ManyToOne(() => RoleEntity)
  role: RoleEntity;

  @OneToMany(() => UserTokenEntity, (e) => e.user, { cascade: ['soft-remove', 'remove'] })
  userTokens?: UserTokenEntity[];
}
