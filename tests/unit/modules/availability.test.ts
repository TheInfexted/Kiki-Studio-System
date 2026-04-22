import { describe, it, expect } from 'vitest';
import { computeAvailableSlots } from '@/modules/availability/slot-search';

describe('computeAvailableSlots', () => {
  const rules = [
    { id: 'r1', weekday: 1, startTime: '10:00', endTime: '18:00', active: true },
  ];

  it('returns slots inside the rule, minus travel buffer', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'),
      rules,
      blocks: [],
      existingBookings: [],
    });
    expect(slots[0].startKl).toBe('10:00');
    expect(slots.at(-1)!.startKl).toBe('17:00');
  });

  it('excludes a slot that overlaps an existing booking', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'),
      rules,
      blocks: [],
      existingBookings: [
        { scheduledAt: new Date('2026-05-04T04:00:00Z'), durationMin: 90 },
      ],
    });
    expect(slots.find(s => s.startKl === '11:30')).toBeUndefined();
    expect(slots.find(s => s.startKl === '12:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '12:30')).toBeUndefined();
    expect(slots.find(s => s.startKl === '13:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '13:30')).toBeDefined();
  });

  it('respects an availability block', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'),
      rules,
      blocks: [{ startAt: new Date('2026-05-04T06:30:00Z'), endAt: new Date('2026-05-04T08:00:00Z') }],
      existingBookings: [],
    });
    expect(slots.find(s => s.startKl === '14:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '15:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '13:30')).toBeDefined();
    expect(slots.find(s => s.startKl === '16:00')).toBeDefined();
  });

  it('enforces the minimum lead time', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 24,
      now: new Date('2026-05-03T06:00:00Z'),
      rules,
      blocks: [],
      existingBookings: [],
    });
    expect(slots.find(s => s.startKl === '10:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '14:00')).toBeDefined();
  });

  it('adds travel buffer around an existing home booking', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 60,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'),
      rules,
      blocks: [],
      existingBookings: [
        { scheduledAt: new Date('2026-05-04T04:00:00Z'), durationMin: 60 },
      ],
    });
    expect(slots.find(s => s.startKl === '11:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '14:00')).toBeDefined();
    expect(slots.find(s => s.startKl === '13:30')).toBeUndefined();
  });
});
