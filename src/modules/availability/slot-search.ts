import { klToUtc, formatKl } from '@/lib/date';

export interface SlotSearchRule {
  weekday: number;
  startTime: string;
  endTime: string;
  active: boolean;
}
export interface SlotSearchBlock {
  startAt: Date;
  endAt: Date;
}
export interface SlotSearchBooking {
  scheduledAt: Date;
  durationMin: number;
}

export interface SlotSearchInput {
  dateKl: string;
  durationMin: number;
  slotGranularityMin: number;
  travelBufferMin: number;
  minLeadHours: number;
  now: Date;
  rules: SlotSearchRule[];
  blocks: SlotSearchBlock[];
  existingBookings: SlotSearchBooking[];
}

export interface Slot {
  startKl: string;
  startAt: Date;
  endAt: Date;
}

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(':').map(Number);
  return { h, m };
}

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function computeAvailableSlots(input: SlotSearchInput): Slot[] {
  const [y, m, d] = input.dateKl.split('-').map(Number);
  const klMidnight = new Date(y, m - 1, d, 0, 0, 0);
  const weekday = klMidnight.getDay();
  const dayRules = input.rules.filter(r => r.active && r.weekday === weekday);
  if (dayRules.length === 0) return [];

  const minStart = addMinutes(input.now, input.minLeadHours * 60);
  const slots: Slot[] = [];

  for (const rule of dayRules) {
    const { h: sh, m: sm } = parseHm(rule.startTime);
    const { h: eh, m: em } = parseHm(rule.endTime);
    const windowStartKl = new Date(y, m - 1, d, sh, sm, 0);
    const windowEndKl = new Date(y, m - 1, d, eh, em, 0);
    const windowStartUtc = klToUtc(windowStartKl);
    const windowEndUtc = klToUtc(windowEndKl);

    let cursor = windowStartUtc;
    while (addMinutes(cursor, input.durationMin) <= windowEndUtc) {
      const slotEnd = addMinutes(cursor, input.durationMin);

      if (cursor < minStart) {
        cursor = addMinutes(cursor, input.slotGranularityMin);
        continue;
      }

      const conflictsBlock = input.blocks.some(b => overlaps(cursor, slotEnd, b.startAt, b.endAt));
      const conflictsBooking = input.existingBookings.some(b => {
        const bStart = addMinutes(b.scheduledAt, -input.travelBufferMin);
        const bEnd = addMinutes(b.scheduledAt, b.durationMin + input.travelBufferMin);
        return overlaps(cursor, slotEnd, bStart, bEnd);
      });

      if (!conflictsBlock && !conflictsBooking) {
        slots.push({
          startKl: formatKl(cursor, 'HH:mm'),
          startAt: cursor,
          endAt: slotEnd,
        });
      }

      cursor = addMinutes(cursor, input.slotGranularityMin);
    }
  }

  return slots;
}
