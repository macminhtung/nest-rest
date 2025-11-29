import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEFAULT_ROLES } from '@/common/constants';
import { ETableName } from '@/common/enums';

export class Migration1764450578239 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const values = Object.values(DEFAULT_ROLES)
      .map((item) => `(${item.id}, '${item.name}')`)
      .join(', ');

    // INSERT DEFAULT_ROLES
    await queryRunner.query(`
      INSERT INTO \`${ETableName.ROLE}\` (\`id\`, \`name\`) VALUES
      ${values}
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const defaultRoleIds = Object.values(DEFAULT_ROLES).map((role) => role.id);
    await queryRunner.query(`
      DELETE FROM \`${ETableName.ROLE}\` 
      WHERE \`id\` IN (${defaultRoleIds.join(', ')});
  `);
  }
}
