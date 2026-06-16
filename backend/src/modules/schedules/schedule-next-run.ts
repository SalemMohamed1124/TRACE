import { ScanFrequency } from '../../common/enums/index.js';

export interface ScheduleAnchor {
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
}

function parseTimeOfDay(timeOfDay: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  return { hours, minutes };
}

function withTime(date: Date, timeOfDay: string): Date {
  const { hours, minutes } = parseTimeOfDay(timeOfDay);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function monthlyOccurrence(
  base: Date,
  dayOfMonth: number,
  timeOfDay: string,
): Date {
  const day = Math.min(
    dayOfMonth,
    lastDayOfMonth(base.getFullYear(), base.getMonth()),
  );
  return withTime(
    new Date(base.getFullYear(), base.getMonth(), day),
    timeOfDay,
  );
}

export function createAnchor(reference: Date): Required<ScheduleAnchor> {
  return {
    dayOfWeek: reference.getDay(),
    dayOfMonth: reference.getDate(),
  };
}

export function calculateNextRunAt(
  frequency: ScanFrequency,
  timeOfDay: string,
  from: Date = new Date(),
  anchor: ScheduleAnchor = createAnchor(from),
): Date {
  if (frequency === ScanFrequency.DAILY) {
    const today = withTime(from, timeOfDay);
    if (today > from) return today;

    const tomorrow = new Date(from);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return withTime(tomorrow, timeOfDay);
  }

  if (frequency === ScanFrequency.WEEKLY) {
    const dayOfWeek = anchor.dayOfWeek ?? from.getDay();
    const candidate = withTime(from, timeOfDay);
    const daysUntilAnchor = (dayOfWeek - from.getDay() + 7) % 7;
    candidate.setDate(candidate.getDate() + daysUntilAnchor);

    if (candidate > from) return candidate;

    candidate.setDate(candidate.getDate() + 7);
    return candidate;
  }

  const dayOfMonth = anchor.dayOfMonth ?? from.getDate();
  let candidate = monthlyOccurrence(from, dayOfMonth, timeOfDay);
  if (candidate > from) return candidate;

  const nextMonthBase = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  candidate = monthlyOccurrence(nextMonthBase, dayOfMonth, timeOfDay);
  return candidate;
}

export function advanceNextRunAt(
  frequency: ScanFrequency,
  timeOfDay: string,
  previousRunAt: Date,
  anchor: ScheduleAnchor = createAnchor(previousRunAt),
): Date {
  return calculateNextRunAt(frequency, timeOfDay, previousRunAt, anchor);
}
