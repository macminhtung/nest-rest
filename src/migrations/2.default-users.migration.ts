import { MigrationInterface, QueryRunner } from 'typeorm';
import { EEntity } from '@/common/enums';
import { DEFAULT_ROLES } from '@/common/constants';

export class DefaultUsersMigration_1711200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // INSERT ADMIN
    await queryRunner.query(`
      INSERT INTO "${EEntity.USER}" (id, role_id, email, first_name, last_name, password, is_email_verified)
      VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', ${DEFAULT_ROLES.ADMIN.id}, 'admin@gmail.com', 'T', 'MM', '$2b$10$yZcgS/ffS6xicYduxWzWdOayop7Dg/k06SxkzelJKJQ.9MnHF7yeO', TRUE);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "${EEntity.USER}"`);
  }
}
