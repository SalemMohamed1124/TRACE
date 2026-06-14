import { ScanFrequency } from '../../common/enums/index.js';
import { advanceNextRunAt, calculateNextRunAt } from './schedule-next-run.js';

describe('schedule recurrence calculation', () => {
  it('schedules daily runs later today when the selected time is still future', () => {
    const next = calculateNextRunAt(
      ScanFrequency.DAILY,
      '14:30',
      new Date(2026, 5, 14, 9, 0),
    );

    expect(next).toEqual(new Date(2026, 5, 14, 14, 30));
  });

  it('schedules daily runs tomorrow when the selected time has passed', () => {
    const next = calculateNextRunAt(
      ScanFrequency.DAILY,
      '08:15',
      new Date(2026, 5, 14, 9, 0),
    );

    expect(next).toEqual(new Date(2026, 5, 15, 8, 15));
  });

  it('uses the weekly anchor day when calculating the first occurrence', () => {
    const next = calculateNextRunAt(
      ScanFrequency.WEEKLY,
      '10:00',
      new Date(2026, 5, 14, 9, 0),
      { dayOfWeek: 2 },
    );

    expect(next).toEqual(new Date(2026, 5, 16, 10, 0));
  });

  it('advances weekly schedules by seven days from the previous occurrence', () => {
    const next = advanceNextRunAt(
      ScanFrequency.WEEKLY,
      '10:00',
      new Date(2026, 5, 16, 10, 0),
      { dayOfWeek: 2 },
    );

    expect(next).toEqual(new Date(2026, 5, 23, 10, 0));
  });

  it('clamps monthly advancement to the last valid day of the next month', () => {
    const next = advanceNextRunAt(
      ScanFrequency.MONTHLY,
      '03:45',
      new Date(2026, 0, 31, 3, 45),
      { dayOfMonth: 31 },
    );

    expect(next).toEqual(new Date(2026, 1, 28, 3, 45));
  });
});
