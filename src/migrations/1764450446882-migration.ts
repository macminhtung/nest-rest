import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764450446882 implements MigrationInterface {
  name = 'Migration1764450446882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`role\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` int NOT NULL, \`name\` enum ('admin', 'user') NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_token\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` uuid NOT NULL, \`hash_token\` varchar(255) NOT NULL, \`type\` enum ('ACCESS_TOKEN', 'REFRESH_TOKEN') NOT NULL, \`refresh_token_id\` uuid NULL, \`user_id\` uuid NOT NULL, INDEX \`IDX_195d98fb5e96f44b4588cd8f45\` (\`user_id\`, \`type\`, \`hash_token\`), UNIQUE INDEX \`IDX_f45f28a3a739d71c52d2f06cc8\` (\`refresh_token_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`project\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` uuid NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, INDEX \`IDX_dedfea394088ed136ddadeee89\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`task\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` uuid NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`status\` enum ('TODO', 'DOING', 'IN REVIEW', 'DONE', 'DROPPED') NOT NULL DEFAULT 'TODO', \`project_id\` uuid NOT NULL, \`user_id\` uuid NOT NULL, \`projectId\` uuid NULL, \`userId\` uuid NULL, INDEX \`IDX_2fe7a278e6f08d2be55740a939\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` uuid NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`first_name\` varchar(40) NOT NULL, \`last_name\` varchar(40) NOT NULL, \`location\` varchar(200) NULL, \`role_id\` int NOT NULL, INDEX \`IDX_7a4fd2a547828e5efe420e50d1\` (\`first_name\`), INDEX \`IDX_6937e802be2946855a3ad0e6be\` (\`last_name\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_project\` (\`user_id\` uuid NOT NULL, \`project_id\` uuid NOT NULL, INDEX \`IDX_dd66dc6a11849a786759c22553\` (\`user_id\`), INDEX \`IDX_9f6abe80cbe92430eaa7a720c2\` (\`project_id\`), PRIMARY KEY (\`user_id\`, \`project_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_token\` ADD CONSTRAINT \`FK_79ac751931054ef450a2ee47778\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`task\` ADD CONSTRAINT \`FK_3797a20ef5553ae87af126bc2fe\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`task\` ADD CONSTRAINT \`FK_f316d3fe53497d4d8a2957db8b9\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_project\` ADD CONSTRAINT \`FK_dd66dc6a11849a786759c225537\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_project\` ADD CONSTRAINT \`FK_9f6abe80cbe92430eaa7a720c26\` FOREIGN KEY (\`project_id\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_project\` DROP FOREIGN KEY \`FK_9f6abe80cbe92430eaa7a720c26\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_project\` DROP FOREIGN KEY \`FK_dd66dc6a11849a786759c225537\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_f316d3fe53497d4d8a2957db8b9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_3797a20ef5553ae87af126bc2fe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_token\` DROP FOREIGN KEY \`FK_79ac751931054ef450a2ee47778\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_9f6abe80cbe92430eaa7a720c2\` ON \`user_project\``);
    await queryRunner.query(`DROP INDEX \`IDX_dd66dc6a11849a786759c22553\` ON \`user_project\``);
    await queryRunner.query(`DROP TABLE \`user_project\``);
    await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_6937e802be2946855a3ad0e6be\` ON \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_7a4fd2a547828e5efe420e50d1\` ON \`user\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_2fe7a278e6f08d2be55740a939\` ON \`task\``);
    await queryRunner.query(`DROP TABLE \`task\``);
    await queryRunner.query(`DROP INDEX \`IDX_dedfea394088ed136ddadeee89\` ON \`project\``);
    await queryRunner.query(`DROP TABLE \`project\``);
    await queryRunner.query(`DROP INDEX \`IDX_f45f28a3a739d71c52d2f06cc8\` ON \`user_token\``);
    await queryRunner.query(`DROP INDEX \`IDX_195d98fb5e96f44b4588cd8f45\` ON \`user_token\``);
    await queryRunner.query(`DROP TABLE \`user_token\``);
    await queryRunner.query(`DROP TABLE \`role\``);
  }
}
