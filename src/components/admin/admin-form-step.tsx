import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/forms/phone-input';
import { LocationModeToggle } from '@/components/forms/location-mode-toggle';
import { GoogleMapPicker } from '@/components/google-maps/picker';
import { ManualCoordinates } from '@/components/forms/manual-coordinates';
import { useEffect } from 'react';
import { Country } from 'country-state-city';
import { AddressInputs } from '@/components/forms/address-inputs';
import { validatePhone } from '@/lib/phone-validation';

interface AdminFormStepProps {
  step: number;
  register: any;
  watch: any;
  setValue: any;
  errors: Record<string, { message?: string }>;
  trigger?: (...args: any[]) => Promise<boolean>;
}

export function AdminFormStep({
  step,
  register,
  watch,
  setValue,
  errors,
  trigger,
}: AdminFormStepProps) {
  const formValues = watch();

  useEffect(() => {
    if (!watch('countryIso') && formValues.country) {
      const match = Country.getAllCountries().find(
        (c) => c.name.toLowerCase() === formValues.country.toLowerCase(),
      );
      if (match) {
        setValue('countryIso', match.isoCode);
      }
    }
  }, []);

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#777]">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                First Name
                <span className="text-[#16610E]"> *</span>
              </label>
              <Input
                placeholder="Enter first name"
                {...register('firstName')}
                className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Last Name
                <span className="text-[#16610E]"> *</span>
              </label>
              <Input
                placeholder="Enter last name"
                {...register('lastName')}
                className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Email Address
                <span className="text-[#16610E]"> *</span>
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                {...register('email')}
                className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Phone Number
                <span className="text-[#16610E]"> *</span>
              </label>
              <PhoneInput
                value={formValues.phoneNumber}
                onChange={(val) =>
                  setValue('phoneNumber', val, {
                    shouldValidate: true,
                  })
                }
                countryCode={formValues.countryCode}
                onCountryCodeChange={(code) =>
                  setValue('countryCode', code, {
                    shouldValidate: true,
                  })
                }
                error={errors.phoneNumber?.message}
                onValidate={(err) => {
                  if (err) {
                    setValue('phoneNumber', formValues.phoneNumber, {
                      shouldValidate: true,
                    });
                    const result = validatePhone(formValues.phoneNumber, formValues.countryCode);
                    if (!result.valid && result.error) {
                      setValue('phoneNumber', undefined, { shouldValidate: true });
                    }
                  }
                  trigger?.('phoneNumber');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const locationMode = watch('locationMode') || 'map';
    const latitude = watch('latitude') || 0;
    const longitude = watch('longitude') || 0;

    const handleModeChange = (mode: 'map' | 'manual') => {
      setValue('locationMode', mode);
    };

    const handleCoordinatePick = (lat: number, lng: number) => {
      setValue('latitude', lat, { shouldValidate: true });
      setValue('longitude', lng, { shouldValidate: true });
    };

    return (
      <div className="space-y-6">
        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#777]">
            Address Information
          </h4>
          <div className="space-y-5">
            <LocationModeToggle
              value={locationMode}
              onChange={handleModeChange}
            />

            {locationMode === 'map' ? (
              <GoogleMapPicker
                latitude={latitude}
                longitude={longitude}
                onPick={handleCoordinatePick}
              />
            ) : (
              <ManualCoordinates
                latitude={latitude}
                longitude={longitude}
                onChange={handleCoordinatePick}
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Address
                <span className="text-[#16610E]"> *</span>
              </label>
              <Textarea
                placeholder="Enter address"
                {...register('address')}
                className="min-h-[80px] rounded-xl border-[#e5e5e5] bg-[#fafaf8] p-4"
              />
              {errors.address && (
                <p className="text-sm text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            <AddressInputs
              countryIso={watch('countryIso') || ''}
              country={formValues.country}
              state={formValues.state}
              city={formValues.city}
              postalCode={formValues.postalCode}
              onCountryChange={(name, iso) => {
                setValue('country', name);
                setValue('countryIso', iso);
                setValue('state', '');
                setValue('city', '');
              }}
              onStateChange={(name, _iso) => {
                setValue('state', name);
                setValue('city', '');
              }}
              onCityChange={(name) =>
                setValue('city', name)
              }
              onPostalCodeChange={(val) =>
                setValue('postalCode', val)
              }
              errors={{
                country: errors.country?.message,
                state: errors.state?.message,
                city: errors.city?.message,
                postalCode: errors.postalCode?.message,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
