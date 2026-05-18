import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { ArrowLeft, Shield, Mail, MapPin, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Stepper } from '@/components/ui/stepper';
import { AppLayout } from '@/components/layout/AppLayout';
import { AddressPicker } from '@/components/forms/address-picker';

import { ROUTES } from '@/constants';
import { useCreateAdminUserMutation } from '../../../store/api';

const createAdminSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),

  lastName: z.string().min(1, 'Last name is required'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d+$/, 'Phone number must be numeric'),
  countryCode: z.string().min(1, 'Country code is required'),
  address: z.string().min(1, 'Address is required'),

  city: z.string().min(1, 'City is required'),

  state: z.string().min(1, 'State is required'),

  postalCode: z.string().min(1, 'Postal code is required'),

  country: z.string().min(1, 'Country is required'),

  location: z.string(),

  latitude: z.number(),

  longitude: z.number(),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

const initialFormData: CreateAdminFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  countryCode: '+1',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  location: '',
  latitude: 40.7128,
  longitude: -74.006,
};

const steps = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Admin contact details',
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: 2,
    title: 'Location',
    description: 'Address information',
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    id: 3,
    title: 'Review',
    description: 'Verify details',
    icon: <Check className="h-4 w-4" />,
  },
];

export default function CreateAdminPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [createAdmin, { isLoading }] = useCreateAdminUserMutation();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    mode: 'all',
    resolver: zodResolver(createAdminSchema),
    defaultValues: initialFormData,
  });

  const formValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateAdminFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
      ];
    }

    if (currentStep === 2) {
      fieldsToValidate = [
        'address',
        'city',
        'state',
        'postalCode',
        'country',
      ];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      await createAdmin({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        city: data.city,
        address: data.address,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,

        location: {
          type: 'Point',
          coordinates: [data.longitude, data.latitude],
        },
      }).unwrap();

      toast.success('Admin created successfully');

      navigate(ROUTES.SUPER_ADMIN_ADMINS);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create admin');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
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

                <div className="space-y-2 md:col-span-2">
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
                    Country Code
                  </label>

                  <Input
                    placeholder="+1"
                    {...register('countryCode')}
                    className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#151515]">
                    Phone Number
                    <span className="text-[#16610E]"> *</span>
                  </label>

                  <Input
                    placeholder="Enter phone number"
                    value={formValues.phoneNumber || ''}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(
                        /\D/g,
                        '',
                      );

                      setValue('phoneNumber', numeric, {
                        shouldValidate: true,
                      });
                    }}
                    className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
                  />

                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#777]">
                Address Information
              </h4>

              <div className="space-y-5">
                <AddressPicker
                  label="Search Location"
                  value={formValues.location || ''}
                  onChange={(value) => setValue('location', value)}
                  required
                />

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

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#151515]">
                      City
                    </label>

                    <Input
                      placeholder="Enter city"
                      {...register('city')}
                      className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#151515]">
                      State
                    </label>

                    <Input
                      placeholder="Enter state"
                      {...register('state')}
                      className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#151515]">
                      Postal Code
                    </label>

                    <Input
                      placeholder="Enter postal code"
                      {...register('postalCode')}
                      className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-red-500">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#151515]">
                      Country
                    </label>

                    <Input
                      placeholder="Enter country"
                      {...register('country')}
                      className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
                    />
                    {errors.country && (
                      <p className="text-sm text-red-500">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-[#fafaf8] p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf8e7]">
                  <Check className="h-6 w-6 text-[#16610E]" />
                </div>

                <h5 className="mb-2 text-lg font-semibold text-[#151515]">
                  Review Admin Information
                </h5>

                <div className="mt-6 space-y-2 rounded-lg bg-white p-4 text-left text-sm">
                  <p>
                    <span className="text-[#777]">Name:</span>{' '}
                    <span className="font-medium">
                      {formValues.firstName} {formValues.lastName}
                    </span>
                  </p>

                  <p>
                    <span className="text-[#777]">Email:</span>{' '}
                    <span className="font-medium">
                      {formValues.email}
                    </span>
                  </p>

                  <p>
                    <span className="text-[#777]">Phone:</span>{' '}
                    <span className="font-medium">
                      {formValues.countryCode}{' '}
                      {formValues.phoneNumber}
                    </span>
                  </p>

                  <p>
                    <span className="text-[#777]">Address:</span>{' '}
                    <span className="font-medium">
                      {formValues.address}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="w-full flex-1 overflow-y-auto p-10">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.SUPER_ADMIN_ADMINS)}
          className="mb-6 gap-2 text-[#777] hover:bg-[#edf8e7] hover:text-[#16610E]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admins
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#151515]">
            Create Admin
          </h1>

          <p className="mt-1 text-[#777]">
            Add a new administrator account
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-[#ececec] bg-white p-6 shadow-sm">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-sm">
          <div className="border-b border-[#ececec] bg-[#fafaf8] px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf8e7]">
                <Shield className="h-6 w-6 text-[#16610E]" />
              </div>

              <div>
                <p className="text-sm text-[#777]">
                  Step {currentStep} of {steps.length}
                </p>

                <h3 className="text-xl font-semibold text-[#151515]">
                  {steps[currentStep - 1].title}
                </h3>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-8">{renderStepContent()}</div>

            <div className="flex items-center justify-between border-t border-[#ececec] bg-[#fafaf8] px-8 py-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="h-12 rounded-xl px-6"
              >
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-12 rounded-xl bg-[#16610E] px-8 text-white hover:bg-[#1a7a12]"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-[#16610E] px-8 text-white hover:bg-[#1a7a12]"
                >
                  {isLoading ? 'Creating...' : 'Create Admin'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
