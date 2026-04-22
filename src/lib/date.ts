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
