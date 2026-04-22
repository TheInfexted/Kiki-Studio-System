import { parsePhoneNumberFromString as parsePhoneMin, type CountryCode } from 'libphonenumber-js';
import parsePhoneMax from 'libphonenumber-js/max';

export function normalizePhone(input: string, defaultCountry: CountryCode = 'MY'): string {
  const parsed = parsePhoneMin(input, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    throw new Error(`Invalid phone number: ${input}`);
  }
  return parsed.number;
}

export function isValidMalaysianMobile(e164: string): boolean {
  const parsed = parsePhoneMax(e164);
  return !!parsed && parsed.country === 'MY' && parsed.getType() === 'MOBILE';
}
