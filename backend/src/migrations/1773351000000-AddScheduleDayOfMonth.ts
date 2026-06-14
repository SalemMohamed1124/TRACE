import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduleDayOfMonth1773351000000 implements MigrationInterface {
  name = 'AddScheduleDayOfMonth1773351000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scan_schedules" ADD "day_of_month" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scan_schedules" DROP COLUMN "day_of_month"`,
    );
  }
}
