import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/forms/phone-input';
import { LocationModeToggle } from '@/components/forms/location-mode-toggle';
import { GoogleMapPicker } from '@/components/google-maps/picker';
import { ManualCoordinates } from '@/components/forms/manual-coordinates';

interface AdminFormStepProps {
  step: number;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  trigger?: any;
}

export function AdminFormStep({
  step,
  register,
  watch,
  setValue,
  errors,
  trigger: _trigger,
}: AdminFormStepProps) {

  const formValues = {
    phoneNumber: watch('phoneNumber'),
    countryCode: watch('countryCode'),
  };

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
    const locationMode = (watch('locationMode') || 'manual') as 'map' | 'manual';
    const latitude = watch('latitude') as number;
    const longitude = watch('longitude') as number;

    const handleModeChange = (mode: 'map' | 'manual') => {
      setValue('locationMode', mode);
    };

    const handleCoordinatePick = (lat: number, lng: number, address?: string) => {
      setValue('latitude', lat, { shouldValidate: true });
      setValue('longitude', lng, { shouldValidate: true });
      if (address) {
        setValue('address', address, { shouldValidate: true, shouldDirty: true });
      }
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
