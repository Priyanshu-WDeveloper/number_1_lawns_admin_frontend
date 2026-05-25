import { State, City } from 'country-state-city';
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

const postalPatterns: Record<string, RegExp> = {
  NZ: /^\d{4}$/,
  AU: /^\d{4}$/,
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
  GB: /^[A-Za-z]{1,2}\d{1,2}[A-Za-z]? ?\d[A-Za-z]{2}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  IN: /^\d{6}$/,
  BR: /^\d{5}-?\d{3}$/,
  JP: /^\d{3}-?\d{4}$/,
  CN: /^\d{6}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4}[A-Za-z]{2}$/,
  SE: /^\d{3} ?\d{2}$/,
  NO: /^\d{4}$/,
  DK: /^\d{4}$/,
  FI: /^\d{5}$/,
  SG: /^\d{6}$/,
  HK: /^\d{3,6}$/,
  ZA: /^\d{4}$/,
};

const postalExamples: Record<string, string> = {
  NZ: 'e.g. 0610',
  AU: 'e.g. 2000',
  US: 'e.g. 90210 or 90210-1234',
  CA: 'e.g. K1A 0B1',
  GB: 'e.g. SW1A 1AA',
  DE: 'e.g. 10115',
  FR: 'e.g. 75001',
  IN: 'e.g. 110001',
  BR: 'e.g. 01310-000',
  JP: 'e.g. 100-0001',
  CN: 'e.g. 100000',
  IT: 'e.g. 00100',
  ES: 'e.g. 28001',
  NL: 'e.g. 1012AB',
  SE: 'e.g. 111 20',
  NO: 'e.g. 0150',
  DK: 'e.g. 1050',
  FI: 'e.g. 00100',
  SG: 'e.g. 238859',
  HK: 'e.g. — (not used)',
  ZA: 'e.g. 2000',
};

export function getPostalCodeRegex(countryIso: string): RegExp {
  return postalPatterns[countryIso] || /^\d{3,10}$/;
}

export function getPostalCodeExample(countryIso: string): string {
  return postalExamples[countryIso] || '';
}

export function validateAddress(
  countryIso: string,
  stateName: string,
  cityName: string,
  postalCode: string,
): { valid: boolean; error?: string; path?: string } {
  if (stateName) {
    const states = State.getStatesOfCountry(countryIso) ?? [];
    if (states.length > 0) {
      const stateMatch = states.find(
        (s) => s.name.toLowerCase() === stateName.toLowerCase(),
      );
      if (!stateMatch) {
        return {
          valid: false,
          error: `State "${stateName}" is not valid for the selected country`,
          path: 'state',
        };
      }

      if (cityName) {
        const cities = City.getCitiesOfState(countryIso, stateMatch.isoCode) ?? [];
        if (cities.length > 0) {
          const cityMatch = cities.find(
            (c) => c.name.toLowerCase() === cityName.toLowerCase(),
          );
          if (!cityMatch) {
            return {
              valid: false,
              error: `City "${cityName}" is not valid for the selected state`,
              path: 'city',
            };
          }
        }
      }
    }
  }

  if (postalCode) {
    const regex = getPostalCodeRegex(countryIso);
    if (!regex.test(postalCode)) {
      const example = getPostalCodeExample(countryIso);
      const msg = example
        ? `Invalid postal code format for selected country (${example})`
        : 'Invalid postal code format for selected country';
      return { valid: false, error: msg, path: 'postalCode' };
    }
  }

  return { valid: true };
}
