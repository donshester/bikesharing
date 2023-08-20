import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1692567428042 implements MigrationInterface {
    name = 'InitTables1692567428042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "email" character varying NOT NULL, "hashedPassword" character varying NOT NULL, "isBlocked" boolean NOT NULL DEFAULT true, "activationToken" character varying, "firstName" character varying NOT NULL, "secondName" character varying NOT NULL, "phone" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_9117cd802f56e45adfaeb567438" UNIQUE ("email", "phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "drives" ("id" SERIAL NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP, "cost" numeric(10,2), "userId" uuid, "bikeId" integer, CONSTRAINT "PK_bae73130c1430cebac87a775037" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bikes_status_enum" AS ENUM('Serviceable', 'OutOfOrder')`);
        await queryRunner.query(`CREATE TABLE "bikes" ("id" SERIAL NOT NULL, "modelName" character varying NOT NULL, "hourlyPrice" double precision NOT NULL, "description" character varying NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "longitude" double precision NOT NULL, "latitude" double precision NOT NULL, "status" "public"."bikes_status_enum" NOT NULL DEFAULT 'Serviceable', CONSTRAINT "PK_5237c1fcb162998a0d31e640814" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "drives" ADD CONSTRAINT "FK_a8e8345f84d70ee5df2af3bc3fe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drives" ADD CONSTRAINT "FK_ba550c420a114e578d85403f728" FOREIGN KEY ("bikeId") REFERENCES "bikes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drives" DROP CONSTRAINT "FK_ba550c420a114e578d85403f728"`);
        await queryRunner.query(`ALTER TABLE "drives" DROP CONSTRAINT "FK_a8e8345f84d70ee5df2af3bc3fe"`);
        await queryRunner.query(`DROP TABLE "bikes"`);
        await queryRunner.query(`DROP TYPE "public"."bikes_status_enum"`);
        await queryRunner.query(`DROP TABLE "drives"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
