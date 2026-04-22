export function fromCents(cents: number): number {
  return cents / 100;
}

export function toCents(ringgit: number): number {
  return Math.round(ringgit * 100);
}

export function formatMYR(cents: number): string {
  const value = fromCents(cents);
  const formatted = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `RM ${formatted}`;
}
