'use client';
import { useEffect, useState } from 'react';
import { Button, Input } from '@/ui';

interface SlotDto { startKl: string; startAtIso: string; }

export function SlotStep({ serviceSlug, onPick, onBack }: {
  serviceSlug: string;
  onPick: (s: SlotDto) => void;
  onBack: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<SlotDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setError(null);
    fetch(`/api/availability?service=${encodeURIComponent(serviceSlug)}&date=${date}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => { if (!cancelled) setSlots(data.slots); })
      .catch((e) => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, [serviceSlug, date]);

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Choose a date</h3>
      <Input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} name="date" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {slots === null && !error && <p>Loading slots…</p>}
        {error && <p className="col-span-3 text-red-600">{error}</p>}
        {slots?.length === 0 && <p className="col-span-3 text-neutral-500">No slots available this day.</p>}
        {slots?.map((s) => (
          <button
            key={s.startAtIso}
            onClick={() => onPick(s)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:border-brand-500"
          >
            {s.startKl}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <Button variant="ghost" onClick={onBack}>Back</Button>
      </div>
    </div>
  );
}
