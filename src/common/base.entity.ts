import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseEntity {
  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @ApiPropertyOptional()
  @UpdateDateColumn({ type: 'timestamp without time zone', nullable: true })
  updatedAt?: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn({ type: 'timestamp without time zone', nullable: true })
  deletedAt?: Date;
}
