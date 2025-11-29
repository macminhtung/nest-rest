import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn, Index } from 'typeorm';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { TaskEntity } from '@/modules/task/task.entity';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: ETableName.PROJECT })
export class ProjectEntity extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text', length: 1000 })
  description: string;

  // Relation tables
  @OneToMany(() => TaskEntity, (task) => task.project)
  tasks: TaskEntity[];

  @ManyToMany(() => UserEntity, (user) => user.projects, { onDelete: 'CASCADE' })
  users: UserEntity[];
}
