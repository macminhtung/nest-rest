import { MigrationInterface, QueryRunner } from 'typeorm';
import { ETableName } from '@/common/enums';
import { DEFAULT_ROLES } from '@/common/constants';

export class Migration1764858305501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // INSERT ADMIN
    await queryRunner.query(`
        INSERT INTO "${ETableName.USER}" (id, role_id, email, first_name, last_name, password, is_email_verified)
        VALUES ('00000199-56aa-70dd-8757-bb3e84f4153d', ${DEFAULT_ROLES.ADMIN.id}, 'admin@gmail.com', 'T', 'MM', '$2b$10$yZcgS/ffS6xicYduxWzWdOayop7Dg/k06SxkzelJKJQ.9MnHF7yeO', TRUE);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "${ETableName.USER}" WHERE email = 'admin@gmail.com'`);
  }
}
