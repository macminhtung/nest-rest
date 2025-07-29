import { MigrationInterface, QueryRunner } from 'typeorm';
import { EEntity } from '@/common/enums';

export class DefaultUsersMigration_1711300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // INSERT ADMIN
    await queryRunner.query(`
      INSERT INTO "${EEntity.PRODUCT}" (image, name, description) VALUES
      ('https://github.com/shadcn.png', 'product 1', 'description 1'),
      ('https://github.com/shadcn.png', 'product 2', 'description 2'),
      ('https://github.com/shadcn.png', 'product 3', 'description 3'),
      ('https://github.com/shadcn.png', 'product 4', 'description 4'),
      ('https://github.com/shadcn.png', 'product 5', 'description 5'),
      ('https://github.com/shadcn.png', 'product 6', 'description 6'),
      ('https://github.com/shadcn.png', 'product 7', 'description 7'),
      ('https://github.com/shadcn.png', 'product 8', 'description 8'),
      ('https://github.com/shadcn.png', 'product 9', 'description 9'),
      ('https://github.com/shadcn.png', 'product 10', 'description 10')
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "${EEntity.PRODUCT}"`);
  }
}
