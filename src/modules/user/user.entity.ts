import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EEntity } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { RoleEntity } from '@/modules/user/role/role.entity';

@Entity({ name: EEntity.USER })
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ default: '' })
  avatar: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @Column({ select: false, default: new Date().valueOf().toString() })
  passwordTimestamp: string; // ==> Check JWT after password change

  @ApiProperty()
  @Column({ default: false })
  isEmailVerified: boolean;

  // Relation columns
  @ApiProperty({ type: 'integer' })
  @Column({ type: 'int2' })
  roleId: number;

  // Relation tables
  @ApiPropertyOptional()
  @ManyToOne(() => RoleEntity)
  role: RoleEntity;
}
