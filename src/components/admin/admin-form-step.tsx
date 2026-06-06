import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/forms/phone-input';
import { LocationModeToggle } from '@/components/forms/location-mode-toggle';
import { GoogleMapPicker } from '@/components/google-maps/picker';
import { ManualCoordinates } from '@/components/forms/manual-coordinates';
import { useEffect } from 'react';
import { Country } from 'country-state-city';
import { AddressInputs } from '@/components/forms/address-inputs';
// import { validatePhone } from '@/lib/phone-validation';

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
  // trigger,
}: AdminFormStepProps) {
  // const formValues = watch();

  // const country = watch('country');
  // const countryIso = watch('countryIso');
  // const phoneNumber = watch('phoneNumber')
  const formValues = {
    phoneNumber: watch('phoneNumber'),
    countryCode: watch('countryCode'),
    country: watch('country'),
    countryIso: watch('countryIso'),
    state: watch('state'),
    city: watch('city'),
    postalCode: watch('postalCode'),
  };

  // useEffect(() => {
  //   if (!formValues.countryIso && formValues.country) {
  //     const match = Country.getAllCountries().find(
  //       (c) =>
  //         c.name.toLowerCase() === formValues.country.toLowerCase(),
  //     );

  //     if (match) {
  //       setValue('countryIso', match.isoCode, {
  //         shouldValidate: true,
  //       });
  //     }
  //   }
  // }, [formValues.country, formValues.countryIso, setValue]);

  useEffect(() => {
    // Sync country -> countryIso
    if (formValues.country && !formValues.countryIso) {
      const allCountries = Country.getAllCountries();
      const query = formValues.country.trim().toLowerCase();
      const match =
        allCountries.find((c) => c.name.toLowerCase() === query) ||
        allCountries.find((c) => c.name.toLowerCase().startsWith(query)) ||
        allCountries.find((c) => c.name.toLowerCase().includes(query));

      if (match) {
        setValue('countryIso', match.isoCode, {
          shouldValidate: false,
        });
      }
    }

    // Sync countryIso -> country
    if (formValues.countryIso && !formValues.country) {
      const match = Country.getAllCountries().find(
        (c) => c.isoCode === formValues.countryIso,
      );

      if (match) {
        setValue('country', match.name, {
          shouldValidate: false,
        });
      }
    }
  }, [formValues.country, formValues.countryIso, setValue]);

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                First Name
                <span className="text-primary"> *</span>
              </label>
              <Input
                placeholder="Enter first name"
                {...register('firstName')}
                className="h-12 rounded-xl border-border bg-background"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Last Name
                <span className="text-primary"> *</span>
              </label>
              <Input
                placeholder="Enter last name"
                {...register('lastName')}
                className="h-12 rounded-xl border-border bg-background"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
                <span className="text-primary"> *</span>
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                {...register('email')}
                className="h-12 rounded-xl border-border bg-background"
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number
                <span className="text-primary"> *</span>
              </label>
              {/* <PhoneInput
                value={formValues.phoneNumber ?? ''}
                onChange={(val) =>
                  setValue('phoneNumber', val, {
                    shouldValidate: true,
                    shouldDirty: true,
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
                    const result = validatePhone(
                      formValues.phoneNumber,
                      formValues.countryCode,
                    );
                    // if (!result.valid && result.error) {
                    //   setValue('phoneNumber', undefined, {
                    //     shouldValidate: true,
                    //   });
                    // }
                    // if (!result.valid && result.error) {
                    //   setValue('phoneNumber', '', {
                    //     shouldValidate: true,
                    //     shouldDirty: true,
                    //   });
                    // }
                  }
                  trigger?.('phoneNumber');
                }}
              /> */}
              <PhoneInput
                value={formValues.phoneNumber ?? ''}
                onChange={(val) =>
                  setValue('phoneNumber', val ?? '', {
                    shouldDirty: true,
                  })
                }
                countryCode={formValues.countryCode ?? '+64'}
                onCountryCodeChange={(code) =>
                  setValue('countryCode', code, {
                    shouldDirty: true,
                  })
                }
                error={errors.phoneNumber?.message}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const locationMode = watch('locationMode') || 'manual';
    const latitude = watch('latitude');
    const longitude = watch('longitude');

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
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Address Information
          </h4>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Address
                <span className="text-primary"> *</span>
              </label>
              <Textarea
                placeholder="Enter address"
                {...register('address')}
                className="min-h-[80px] rounded-xl border-border bg-background p-4"
              />
              {errors.address && (
                <p className="text-sm text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            <AddressInputs
              // countryIso={watch('countryIso') || ''}
              countryIso={formValues.countryIso || ''}
              country={formValues.country}
              state={formValues.state}
              city={formValues.city}
              postalCode={formValues.postalCode}
              onCountryChange={(name, iso) => {
                // setValue('country', name);
                // setValue('countryIso', iso);
                setValue('country', name, {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                setValue('countryIso', iso, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setValue('state', '', {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                setValue('city', '', {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              onStateChange={(name, _iso) => {
                setValue('state', name, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setValue('city', '', {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              onCityChange={(name) =>
                // setValue('city', name)
                setValue('city', name, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              onPostalCodeChange={(val) =>
                setValue('postalCode', val, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              errors={{
                country: errors.country?.message,
                state: errors.state?.message,
                city: errors.city?.message,
                postalCode: errors.postalCode?.message,
              }}
            />

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
          </div>
        </div>
      </div>
    );
  }

  return null;
}
