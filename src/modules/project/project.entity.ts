import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn, Index } from 'typeorm';
import { ETableName } from '@/common/enums';
import { BaseEntity } from '@/common/base.entity';
import { TaskEntity } from '@/modules/task/task.entity';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: ETableName.PROJECT })
export class ProjectEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  @Index()
  name: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  // Relation tables
  @ApiPropertyOptional({ type: [TaskEntity] })
  @OneToMany(() => TaskEntity, (task) => task.project)
  tasks?: TaskEntity[];

  @ApiPropertyOptional({ type: [UserEntity] })
  @ManyToMany(() => UserEntity, (user) => user.projects, { onDelete: 'CASCADE' })
  users?: UserEntity[];
}
