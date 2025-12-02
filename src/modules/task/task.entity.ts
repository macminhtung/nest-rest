import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ETaskStatus, ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: ETableName.TASK })
export class TaskEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty()
  @Index()
  @Column({ type: 'simple-enum', enum: ETaskStatus, default: ETaskStatus.TODO })
  status: ETaskStatus;

  // Relation columns
  @ApiProperty()
  @Column({ type: 'uuid' })
  projectId: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  // Relation tables
  @ApiPropertyOptional({ type: () => ProjectEntity })
  @ManyToOne(() => ProjectEntity, (project) => project.tasks, { cascade: ['soft-remove'] })
  @JoinColumn({ name: 'projectId' })
  project?: ProjectEntity;

  @ApiPropertyOptional({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, (user) => user.tasks, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;
}
