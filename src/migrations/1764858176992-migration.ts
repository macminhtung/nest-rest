import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEFAULT_ROLES } from '@/common/constants';
import { ETableName } from '@/common/enums';

export class Migration1764858176992 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const DEFAULT_ROLES_VALUES = Object.values(DEFAULT_ROLES);

    // Insert default roles
    await queryRunner.manager.insert(
      ETableName.ROLE,
      DEFAULT_ROLES_VALUES.map((item) => ({ id: item.id, name: item.name })),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const DEFAULT_ROLE_IDS = Object.values(DEFAULT_ROLES).map((item) => item.id);

    // Delete default roles
    await queryRunner.manager.delete(ETableName.ROLE, DEFAULT_ROLE_IDS);
  }
}
