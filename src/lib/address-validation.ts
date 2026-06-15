import { COUNTRY_CODES } from '@/lib/country-codes';

const uniquePhoneToIso: Record<string, string> = {};
for (const c of COUNTRY_CODES) {
  if (!uniquePhoneToIso[c.code]) {
    uniquePhoneToIso[c.code] = c.isoCode;
  } else {
    uniquePhoneToIso[c.code] = '';
  }
}

export function getCountryIsoFromPhoneCode(code: string): string | null {
  const iso = uniquePhoneToIso[code];
  return iso || null;
}
