import { startOfMonth, endOfMonth } from 'date-fns';
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const KL_TZ = 'Asia/Kuala_Lumpur';

/** Treat the given Date's wall-clock components as KL local time, return UTC instant. */
export function klToUtc(klWallClock: Date): Date {
  return fromZonedTime(klWallClock, KL_TZ);
}

/** Return a Date whose wall-clock components are the KL rendering of the UTC instant. */
export function utcToKl(utc: Date): Date {
  return toZonedTime(utc, KL_TZ);
}

export function formatKl(utc: Date, pattern: string): string {
  return formatInTimeZone(utc, KL_TZ, pattern);
}

/** Start of the KL month (inclusive) containing the given UTC instant, returned as a UTC Date. */
export function startOfMonthInKL(utc: Date): Date {
  const klWall = utcToKl(utc);
  const klMonthStart = startOfMonth(klWall);
  return klToUtc(klMonthStart);
}

/** End of the KL month (exclusive upper bound — start of next month) containing the given UTC instant. */
export function endOfMonthInKL(utc: Date): Date {
  const klWall = utcToKl(utc);
  const klMonthEnd = endOfMonth(klWall);
  // endOfMonth returns the last millisecond of the month; add 1ms to get start-of-next-month as exclusive bound
  return klToUtc(new Date(klMonthEnd.getTime() + 1));
}
