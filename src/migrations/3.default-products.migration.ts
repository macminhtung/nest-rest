import { MigrationInterface, QueryRunner } from 'typeorm';
import { EEntity } from '@/common/enums';

export class DefaultUsersMigration_1711300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // INSERT ADMIN
    await queryRunner.query(`
      INSERT INTO "${EEntity.PRODUCT}" (id, image, name, description) VALUES
        ('019956b7-52a1-7bd1-b14c-d9021ff86179', 'https://github.com/shadcn.png', 'product 1', 'description 1'),
        ('019956b7-52a1-7386-952d-63699269ba4f', 'https://github.com/shadcn.png', 'product 2', 'description 2'),
        ('019956b7-52a1-791c-8c3a-e93c8f46bc9a', 'https://github.com/shadcn.png', 'product 3', 'description 3'),
        ('019956b7-52a1-78ee-849c-8898d9aacf21', 'https://github.com/shadcn.png', 'product 4', 'description 4'),
        ('019956b7-52a1-7cca-8890-7a9f2e1ff70d', 'https://github.com/shadcn.png', 'product 5', 'description 5'),
        ('019956b7-52a1-7cc2-acc9-f37758b72387', 'https://github.com/shadcn.png', 'product 6', 'description 6'),
        ('019956b7-52a1-7b7f-8d8b-e3ad179b03b9', 'https://github.com/shadcn.png', 'product 7', 'description 7'),
        ('019956b7-52a1-7d7c-a6a6-e0d597e23e38', 'https://github.com/shadcn.png', 'product 8', 'description 8'),
        ('019956b7-52a1-745f-a15b-4f1d41d444f5', 'https://github.com/shadcn.png', 'product 9', 'description 9'),
        ('019956b7-52a1-7ab3-bafd-4d7173cb1ac5', 'https://github.com/shadcn.png', 'product 10', 'description 10')
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "${EEntity.PRODUCT}"`);
  }
}
