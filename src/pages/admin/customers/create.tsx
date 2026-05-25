import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Mail, MapPin, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';

import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { ROUTES } from '@/constants';
import { useCreateCustomerMutation } from '@/API/api';
import { AdminFormStepper } from '@/components/admin/admin-form-stepper';
import { AdminFormStep } from '@/components/admin/admin-form-step';
import { AdminReviewCard } from '@/components/admin/admin-review-card';
import { Button } from '@/components/ui/button';
import { validatePhone } from '@/lib/phone-validation';
import { validateAddress, getCountryIsoFromPhoneCode } from '@/lib/address-validation';

const createCustomerSchema = z.object({
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
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .min(3)
    .max(10)
    .regex(/^\d+$/, 'Invalid postal code'),
  country: z.string().min(1, 'Country is required'),
  countryIso: z.string(),
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  locationMode: z.enum(['map', 'manual']),
}).superRefine((data, ctx) => {
  const phoneResult = validatePhone(data.phoneNumber, data.countryCode);
  if (!phoneResult.valid && phoneResult.error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: phoneResult.error,
      path: ['phoneNumber'],
    });
  }

  const iso = data.countryIso || getCountryIsoFromPhoneCode(data.countryCode) || '';
  if (iso && data.country) {
    const addrResult = validateAddress(iso, data.state, data.city, data.postalCode);
    if (!addrResult.valid && addrResult.error && addrResult.path) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: addrResult.error,
        path: [addrResult.path as any],
      });
    }
  }
});

type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;

const initialFormData: CreateCustomerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  countryCode: '+64',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  countryIso: 'NZ',
  location: '',
  latitude: 40.7128,
  longitude: -74.006,
  locationMode: 'map',
};

const steps = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Customer contact details',
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

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCustomerFormData>({
    mode: 'all',
    resolver: zodResolver(createCustomerSchema),
    defaultValues: initialFormData,
  });

  const formValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateCustomerFormData)[] = [];

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

  const onSubmit = async (data: CreateCustomerFormData) => {
    try {
      await createCustomer({
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

      toast.success('Customer created successfully');
      navigate(ROUTES.CUSTOMERS);
    } catch (error: any) {
      toast.error(
        getErrorMessage(error, 'Failed to create customer'),
      );
    }
  };

  const renderStepContent = () => {
    if (currentStep === 3) {
      return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <AdminReviewCard
            firstName={formValues.firstName}
            lastName={formValues.lastName}
            email={formValues.email}
            countryCode={formValues.countryCode}
            phoneNumber={formValues.phoneNumber}
            address={formValues.address}
            city={formValues.city}
            state={formValues.state}
            postalCode={formValues.postalCode}
            country={formValues.country}
            latitude={formValues.latitude}
            longitude={formValues.longitude}
          />
        </form>
      );
    }

    return (
      <AdminFormStep
        step={currentStep}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        trigger={trigger}
      />
    );
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto pl-10 p-5">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.CUSTOMERS)}
            className="mb-4 text-[#777] hover:text-[#16610E] hover:bg-[#edf8e7]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <Navbar
            title="Create Customer"
            subtitle="Add a new customer account"
            showWelcome={false}
          />

          <AdminFormStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isLoading}
            isLastStep={currentStep === steps.length}
            isFirstStep={currentStep === 1}
            submitLabel="Create Customer"
            formRef={formRef}
          >
            {renderStepContent()}
          </AdminFormStepper>
        </div>
      </div>
    </AppLayout>
  );
}
