import { MigrationInterface, QueryRunner } from 'typeorm';
import { ETableName } from '@/common/enums';
import { DEFAULT_ROLES } from '@/common/constants';

export class Migration1764450714620 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // INSERT ADMIN
    await queryRunner.query(`
      INSERT INTO \`${ETableName.USER}\` 
        (\`id\`, \`role_id\`, \`email\`, \`first_name\`, \`last_name\`, \`password\`)
      VALUES 
        ('019ad442-7d5c-725c-ba30-80ae6cb7bb53', ${DEFAULT_ROLES.ADMIN.id}, 'whxoans@gmail.com', 'JoJakeTaemoon', '', '$2b$10$yZcgS/ffS6xicYduxWzWdOayop7Dg/k06SxkzelJKJQ.9MnHF7yeO');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`${ETableName.USER}\`
      WHERE \`id\` = '019ad442-7d5c-725c-ba30-80ae6cb7bb53';
    `);
  }
}
