import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EEntity } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { RoleEntity } from '@/modules/user/role/role.entity';

@Entity({ name: EEntity.USER })
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  email: string;

  @Column()
  password: string;

  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @ApiProperty()
  @Column({ default: new Date().valueOf().toString() })
  passwordTimestamp: string; // ==> Check JWT after password change

  @ApiProperty()
  @Column({ default: false })
  isEmailVerified: boolean;

  // Relation columns
  @ApiProperty({ type: 'integer' })
  @Column({ type: 'int2' })
  roleId: number;

  // Relation tables
  @ManyToOne(() => RoleEntity)
  role: RoleEntity;
}
