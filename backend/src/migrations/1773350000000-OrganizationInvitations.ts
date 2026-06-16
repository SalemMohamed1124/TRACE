import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationInvitations1773350000000 implements MigrationInterface {
  name = 'OrganizationInvitations1773350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'ORG_INVITATION'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invitations_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "role" "public"."organization_members_role_enum" NOT NULL, "status" "public"."organization_invitations_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "org_id" uuid NOT NULL, "invited_user_id" uuid NOT NULL, "invited_by_user_id" uuid, CONSTRAINT "PK_organization_invitations_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organization_invitations_org_user_status" ON "organization_invitations" ("org_id", "invited_user_id", "status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "FK_organization_invitations_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "FK_organization_invitations_invited_user" FOREIGN KEY ("invited_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "FK_organization_invitations_invited_by" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "FK_organization_invitations_invited_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "FK_organization_invitations_invited_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "FK_organization_invitations_org"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_organization_invitations_org_user_status"`,
    );
    await queryRunner.query(`DROP TABLE "organization_invitations"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_invitations_status_enum"`,
    );
  }
}
