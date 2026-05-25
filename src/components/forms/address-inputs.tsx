import { useMemo, useCallback } from 'react';
import { Country, State, City } from 'country-state-city';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { getPostalCodeExample } from '@/lib/address-validation';

interface AddressInputsProps {
  countryIso: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  onCountryChange: (name: string, iso: string) => void;
  onStateChange: (name: string, iso: string) => void;
  onCityChange: (name: string) => void;
  onPostalCodeChange: (value: string) => void;
  errors: {
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
}

const countries = Country.getAllCountries().sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function AddressInputs({
  countryIso,
  country: _country,
  state,
  city,
  postalCode,
  onCountryChange,
  onStateChange,
  onCityChange,
  onPostalCodeChange,
  errors,
}: AddressInputsProps) {
  const states = useMemo(
    () => State.getStatesOfCountry(countryIso) ?? [],
    [countryIso],
  );

  const selectedStateIso = useMemo(() => {
    const match = states.find(
      (s) => s.name.toLowerCase() === state.toLowerCase(),
    );
    return match?.isoCode ?? '';
  }, [states, state]);

  const cities = useMemo(
    () =>
      selectedStateIso
        ? City.getCitiesOfState(countryIso, selectedStateIso) ?? []
        : [],
    [countryIso, selectedStateIso],
  );

  const handleCountryChange = useCallback(
    (iso: string) => {
      const c = countries.find((c) => c.isoCode === iso);
      if (c) {
        onCountryChange(c.name, c.isoCode);
      }
    },
    [onCountryChange],
  );

  const handleStateChange = useCallback(
    (iso: string) => {
      const s = states.find((s) => s.isoCode === iso);
      if (s) {
        onStateChange(s.name, s.isoCode);
      }
    },
    [states, onStateChange],
  );

  const handleCityChange = useCallback(
    (name: string) => {
      onCityChange(name);
    },
    [onCityChange],
  );

  const postalExample = getPostalCodeExample(countryIso);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#151515]">
          Country
          <span className="text-[#16610E]"> *</span>
        </label>
        <Combobox
          options={countries.map((c) => ({
            value: c.isoCode,
            label: c.name,
            icon: c.flag,
          }))}
          value={countryIso}
          onValueChange={handleCountryChange}
          placeholder="Select country"
          searchPlaceholder="Search country..."
          error={errors.country}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#151515]">
          State
          <span className="text-[#16610E]"> *</span>
        </label>
        <Select
          value={selectedStateIso}
          onValueChange={handleStateChange}
          disabled={!countryIso}
        >
          <SelectTrigger
            className={`h-12 rounded-xl border bg-[#fafaf8] px-3 text-sm ${
              errors.state ? 'border-red-500' : 'border-[#e5e5e5]'
            }`}
          >
            <SelectValue
              placeholder={
                !countryIso
                  ? 'Select a country first'
                  : states.length === 0
                    ? 'N/A'
                    : 'Select state'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {states.map((s) => (
              <SelectItem key={s.isoCode} value={s.isoCode}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && (
          <p className="text-sm text-red-500">{errors.state}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#151515]">
          City
          <span className="text-[#16610E]"> *</span>
        </label>
        {cities.length > 0 ? (
          <Select value={city} onValueChange={handleCityChange}>
            <SelectTrigger
              className={`h-12 rounded-xl border bg-[#fafaf8] px-3 text-sm ${
                errors.city ? 'border-red-500' : 'border-[#e5e5e5]'
              }`}
            >
              <SelectValue
                placeholder={
                  !selectedStateIso ? 'Select a state first' : 'Select city'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder={
              !selectedStateIso ? 'Select a state first' : 'Enter city'
            }
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={!selectedStateIso}
            className={`h-12 rounded-xl border bg-[#fafaf8] text-sm ${
              errors.city ? 'border-red-500' : 'border-[#e5e5e5]'
            }`}
          />
        )}
        {errors.city && (
          <p className="text-sm text-red-500">{errors.city}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#151515]">
          Postal Code
          <span className="text-[#16610E]"> *</span>
        </label>
        <Input
          placeholder={`Enter postal code${postalExample ? ` ${postalExample}` : ''}`}
          value={postalCode}
          onChange={(e) => onPostalCodeChange(e.target.value)}
          className={`h-12 rounded-xl border bg-[#fafaf8] text-sm ${
            errors.postalCode ? 'border-red-500' : 'border-[#e5e5e5]'
          }`}
        />
        {errors.postalCode && (
          <p className="text-sm text-red-500">{errors.postalCode}</p>
        )}
      </div>
    </div>
  );
}
