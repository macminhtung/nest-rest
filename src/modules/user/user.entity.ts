import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from 'typeorm';
import { EEntity } from '@/common/enum';
import { BaseEntity } from '@/common/base.entity';
import { RoleEntity } from '@/modules/user/role/role.entity';

@Entity({ name: EEntity.USER })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: new Date().getTime().toString() })
  sessionTimestamp: string;

  // Relation columns
  @Column({ type: 'int2' })
  roleId: string;

  // Relation tables
  @ManyToOne(() => RoleEntity)
  roles: RoleEntity;
}
