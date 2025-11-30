import {
  Column,
  PrimaryColumn,
  Entity,
  ManyToOne,
  OneToMany,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { RoleEntity } from '@/modules/user/role/role.entity';
import { UserTokenEntity } from '@/modules/user/user-token/user-token.entity';
import { TaskEntity } from '@/modules/task/task.entity';
import { ProjectEntity } from '@/modules/project/project.entity';

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
  @Index()
  @Column({ length: 40 })
  firstName: string;

  @ApiProperty()
  @Column({ length: 40 })
  @Index()
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
  @ManyToOne(() => RoleEntity, { onDelete: 'RESTRICT' })
  role: RoleEntity;

  @OneToMany(() => UserTokenEntity, (e) => e.user)
  userTokens: UserTokenEntity[];

  @OneToMany(() => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];

  @ManyToMany(() => ProjectEntity, (project) => project.users)
  @JoinTable({ name: ETableName.USER_PROJECT })
  projects: ProjectEntity[];
}
