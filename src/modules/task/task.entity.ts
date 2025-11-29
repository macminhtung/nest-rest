import { ETaskStatus } from '@/common/enums';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: ETableName.TASK })
export class TaskEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'simple-enum', enum: ETaskStatus, default: ETaskStatus.TODO })
  status: ETaskStatus;

  // Relation columns
  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  userId: string;

  // Relation tables
  @ManyToOne(() => ProjectEntity, (project) => project.tasks, { cascade: ['soft-remove'] })
  @JoinColumn({ name: 'projectId' })
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, (user) => user.tasks, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
