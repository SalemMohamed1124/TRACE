import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import { ScanSchedule } from './scan-schedule.entity.js';
import { ScansService } from '../scans/scans.service.js';
import { advanceNextRunAt } from './schedule-next-run.js';

const DUE_BATCH_SIZE = 25;
const BUSY_RETRY_DELAY_MS = 5 * 60 * 1000;

@Injectable()
export class ScheduleRunnerService {
  private readonly logger = new Logger(ScheduleRunnerService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly scansService: ScansService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runDueSchedules(): Promise<void> {
    const now = new Date();

    await this.dataSource.transaction(async (manager) => {
      const schedules = await manager
        .getRepository(ScanSchedule)
        .createQueryBuilder('schedule')
        .where('schedule.is_active = :isActive', { isActive: true })
        .andWhere('schedule.next_run_at <= :now', { now })
        .orderBy('schedule.next_run_at', 'ASC')
        .limit(DUE_BATCH_SIZE)
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .getMany();

      for (const schedule of schedules) {
        await this.runSchedule(schedule, manager.getRepository(ScanSchedule));
      }
    });
  }

  private async runSchedule(
    schedule: ScanSchedule,
    scheduleRepo: Repository<ScanSchedule>,
  ): Promise<void> {
    const previousRunAt = new Date(schedule.nextRunAt);

    try {
      await this.scansService.createScan(
        schedule.orgId,
        schedule.createdBy,
        {
          assetId: schedule.assetId,
          type: schedule.scanType,
        },
        { isScheduled: true },
      );

      schedule.nextRunAt = advanceNextRunAt(
        schedule.frequency,
        schedule.timeOfDay,
        previousRunAt,
        {
          dayOfWeek: schedule.dayOfWeek,
          dayOfMonth: schedule.dayOfMonth,
        },
      );
      await scheduleRepo.save(schedule);
    } catch (error) {
      if (error instanceof ConflictException) {
        schedule.nextRunAt = new Date(Date.now() + BUSY_RETRY_DELAY_MS);
        await scheduleRepo.save(schedule);
        this.logger.warn(
          `Organization ${schedule.orgId} is at scan concurrency limit; retrying schedule ${schedule.id} at ${schedule.nextRunAt.toISOString()}`,
        );
        return;
      }

      this.logger.error(
        `Failed to run schedule ${schedule.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
