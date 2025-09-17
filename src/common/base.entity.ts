import { Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

export class BaseEntity {
  @ApiProperty()
  @Property({ type: 'timestamptz', default: new Date().toDateString(), onCreate: () => new Date() })
  createdAt?: Date;

  @ApiProperty()
  @Property({
    type: 'timestamptz',
    nullable: true,
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  updatedAt?: Date;

  @ApiProperty()
  @Property({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
