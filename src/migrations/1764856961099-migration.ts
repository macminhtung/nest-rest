import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764856961099 implements MigrationInterface {
  name = 'Migration1764856961099';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."role_name_enum" AS ENUM('admin', 'user')`);
    await queryRunner.query(
      `CREATE TABLE "role" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "id" integer NOT NULL, "name" "public"."role_name_enum" NOT NULL, "description" character varying, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_token_type_enum" AS ENUM('ACCESS_TOKEN', 'REFRESH_TOKEN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_token" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL, "hash_token" character varying NOT NULL, "type" "public"."user_token_type_enum" NOT NULL, "refresh_token_id" uuid, "user_id" uuid NOT NULL, CONSTRAINT "UQ_f45f28a3a739d71c52d2f06cc84" UNIQUE ("refresh_token_id"), CONSTRAINT "PK_48cb6b5c20faa63157b3c1baf7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_195d98fb5e96f44b4588cd8f45" ON "user_token" ("user_id", "type", "hash_token") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_dedfea394088ed136ddadeee89" ON "project" ("name") `);
    await queryRunner.query(
      `CREATE TYPE "public"."task_status_enum" AS ENUM('TODO', 'DOING', 'IN REVIEW', 'DONE', 'DROPPED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "status" "public"."task_status_enum" NOT NULL DEFAULT 'TODO', "project_id" uuid NOT NULL, "user_id" uuid, "projectId" uuid, "userId" uuid, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_2fe7a278e6f08d2be55740a939" ON "task" ("status") `);
    await queryRunner.query(
      `CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying(40), "last_name" character varying(40), "location" character varying(200), "role_id" integer NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7a4fd2a547828e5efe420e50d1" ON "user" ("first_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6937e802be2946855a3ad0e6be" ON "user" ("last_name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL, "image" character varying NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(1000) NOT NULL, CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_project" ("user_id" uuid NOT NULL, "project_id" uuid NOT NULL, CONSTRAINT "PK_3af92ffa56a2ad082dad5407800" PRIMARY KEY ("user_id", "project_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd66dc6a11849a786759c22553" ON "user_project" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f6abe80cbe92430eaa7a720c2" ON "user_project" ("project_id") `,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "location" character varying(200)`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "avatar" character varying(500) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_email_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TYPE "public"."role_name_enum" RENAME TO "role_name_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."role_name_enum" AS ENUM('admin', 'staff', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "name" TYPE "public"."role_name_enum" USING "name"::"text"::"public"."role_name_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."role_name_enum_old"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7a4fd2a547828e5efe420e50d1"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying(100) NOT NULL`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6937e802be2946855a3ad0e6be"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying(100) NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_7a4fd2a547828e5efe420e50d1" ON "user" ("first_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6937e802be2946855a3ad0e6be" ON "user" ("last_name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_token" ADD CONSTRAINT "FK_79ac751931054ef450a2ee47778" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_project" ADD CONSTRAINT "FK_dd66dc6a11849a786759c225537" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_project" ADD CONSTRAINT "FK_9f6abe80cbe92430eaa7a720c26" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_project" DROP CONSTRAINT "FK_9f6abe80cbe92430eaa7a720c26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_project" DROP CONSTRAINT "FK_dd66dc6a11849a786759c225537"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`);
    await queryRunner.query(
      `ALTER TABLE "user_token" DROP CONSTRAINT "FK_79ac751931054ef450a2ee47778"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_6937e802be2946855a3ad0e6be"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7a4fd2a547828e5efe420e50d1"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying(40)`);
    await queryRunner.query(
      `CREATE INDEX "IDX_6937e802be2946855a3ad0e6be" ON "user" ("last_name") `,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying(40)`);
    await queryRunner.query(
      `CREATE INDEX "IDX_7a4fd2a547828e5efe420e50d1" ON "user" ("first_name") `,
    );
    await queryRunner.query(`CREATE TYPE "public"."role_name_enum_old" AS ENUM('admin', 'user')`);
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "name" TYPE "public"."role_name_enum_old" USING "name"::"text"::"public"."role_name_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."role_name_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."role_name_enum_old" RENAME TO "role_name_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_email_verified"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "location" character varying(200)`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9f6abe80cbe92430eaa7a720c2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_dd66dc6a11849a786759c22553"`);
    await queryRunner.query(`DROP TABLE "user_project"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6937e802be2946855a3ad0e6be"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7a4fd2a547828e5efe420e50d1"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2fe7a278e6f08d2be55740a939"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_dedfea394088ed136ddadeee89"`);
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_195d98fb5e96f44b4588cd8f45"`);
    await queryRunner.query(`DROP TABLE "user_token"`);
    await queryRunner.query(`DROP TYPE "public"."user_token_type_enum"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TYPE "public"."role_name_enum"`);
  }
}
