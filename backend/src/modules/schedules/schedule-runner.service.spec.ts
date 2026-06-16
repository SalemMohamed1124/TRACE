import { ConflictException } from '@nestjs/common';
import { ScanFrequency, ScanType } from '../../common/enums/index.js';
import { ScheduleRunnerService } from './schedule-runner.service.js';

function buildRunner({
  schedules,
  createScan,
  save,
}: {
  schedules: any[];
  createScan: jest.Mock;
  save: jest.Mock;
}) {
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    setOnLocked: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(schedules),
  };
  const repo = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    save,
  };
  const manager = {
    getRepository: jest.fn().mockReturnValue(repo),
  };
  const dataSource = {
    transaction: jest.fn(async (callback) => callback(manager)),
  };
  const scansService = { createScan };

  return {
    runner: new ScheduleRunnerService(dataSource as any, scansService as any),
    repo,
    queryBuilder,
  };
}

describe('ScheduleRunnerService', () => {
  it('creates a scheduled scan and advances nextRunAt after success', async () => {
    const schedule = {
      id: 'schedule-1',
      orgId: 'org-1',
      assetId: 'asset-1',
      createdBy: 'user-1',
      scanType: ScanType.QUICK,
      frequency: ScanFrequency.DAILY,
      timeOfDay: '02:00',
      nextRunAt: new Date(2026, 5, 14, 2, 0),
      dayOfWeek: 0,
      dayOfMonth: 14,
    };
    const createScan = jest.fn().mockResolvedValue({});
    const save = jest.fn().mockResolvedValue({});
    const { runner } = buildRunner({ schedules: [schedule], createScan, save });

    await runner.runDueSchedules();

    expect(createScan).toHaveBeenCalledWith(
      'org-1',
      'user-1',
      { assetId: 'asset-1', type: ScanType.QUICK },
      { isScheduled: true },
    );
    expect(schedule.nextRunAt).toEqual(new Date(2026, 5, 15, 2, 0));
    expect(save).toHaveBeenCalledWith(schedule);
  });

  it('pushes a due schedule forward when the organization is busy', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 5, 14, 9, 0));

    const schedule = {
      id: 'schedule-1',
      orgId: 'org-1',
      assetId: 'asset-1',
      createdBy: null,
      scanType: ScanType.DEEP,
      frequency: ScanFrequency.WEEKLY,
      timeOfDay: '09:00',
      nextRunAt: new Date(2026, 5, 14, 9, 0),
      dayOfWeek: 0,
      dayOfMonth: 14,
    };
    const createScan = jest
      .fn()
      .mockRejectedValue(new ConflictException('busy'));
    const save = jest.fn().mockResolvedValue({});
    const { runner } = buildRunner({ schedules: [schedule], createScan, save });

    await runner.runDueSchedules();

    expect(schedule.nextRunAt).toEqual(new Date(2026, 5, 14, 9, 5));
    expect(save).toHaveBeenCalledWith(schedule);

    jest.useRealTimers();
  });
});
