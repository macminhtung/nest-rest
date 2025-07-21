import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEFAULT_ROLES } from '@/common/constants';
import { EEntity } from '@/common/enums';

export class DefaultRolesMigration_1711100000000 implements MigrationInterface {
  name: 'default-records';
  public async up(queryRunner: QueryRunner): Promise<void> {
    const DEFAULT_ROLES_VALUES = Object.values(DEFAULT_ROLES);

    // INSERT DEFAULT_ROLES
    await queryRunner.query(`
      INSERT INTO "${EEntity.ROLE}" ("id", "name") VALUES
      ${DEFAULT_ROLES_VALUES.map((item) => `(${item.id}, '${item.name}')`)}
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "${EEntity.ROLE}"`);
  }
}
