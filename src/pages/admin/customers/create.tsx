import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Mail,
  MapPin,
  Check,
  ArrowLeft,
  User,
  Phone,
  Map,
  Camera,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';

import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { ROUTES } from '@/constants';
import {
  useCreateCustomerMutation,
  useUploadDocumentMutation,
} from '@/API/api';
import { AdminFormStepper } from '@/components/admin/admin-form-stepper';
import { AdminFormStep } from '@/components/admin/admin-form-step';
import { ReviewCard } from '@/components/admin/review-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validatePhone } from '@/lib/phone-validation';
import { PhoneInput } from '@/components/forms/phone-input';

const createCustomerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z
      .string()
      .email('Invalid email address')
      .or(z.literal(''))
      .optional(),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\d+$/, 'Phone number must be numeric'),
    countryCode: z.string().min(1, 'Country code is required'),
    address: z.string().min(1, 'Address is required'),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    locationMode: z.enum(['map', 'manual']),
    profileImage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const phoneResult = validatePhone(
      data.phoneNumber,
      data.countryCode,
    );
    if (!phoneResult.valid && phoneResult.error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: phoneResult.error,
        path: ['phoneNumber'],
      });
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
  location: '',
  latitude: 40.7128,
  longitude: -74.006,
  locationMode: 'map',
  profileImage: '',
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
  const [uploadDocument] = useUploadDocumentMutation();
  const formRef = useRef<HTMLFormElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(
    null,
  );
  const [profileImageError, setProfileImageError] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const profileImageFileRef = useRef<File | null>(null);

  const handleProfileImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    profileImageFileRef.current = file;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
      setProfileImageError(false);
    };
    reader.readAsDataURL(file);
  };

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
        'phoneNumber',
      ];
    }

    if (currentStep === 2) {
      fieldsToValidate = [
        'address',
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
      let profileImageUrl = '';
      if (profileImageFileRef.current) {
        const formData = new FormData();
        formData.append('file', profileImageFileRef.current);
        const res = await uploadDocument(formData).unwrap();
        profileImageUrl = res.url;
      }

      await createCustomer({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        profileImage: profileImageUrl || undefined,
      }).unwrap();

      toast.success('Customer created successfully');
      navigate(ROUTES.CUSTOMERS);
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, 'Failed to create customer'),
      );
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          {/* <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative h-32 w-32">
              <input
                type="file"
                ref={profileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary"
              >
                {profileImage && !profileImageError ? (
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                )}
              </button>
              {profileImage && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileImage(null);
                    profileImageFileRef.current = null;
                  }}
                  className="absolute right-0 top-0 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {profileImage ? 'Change Photo' : 'Upload Profile Image'}
            </p>
          </div> */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide mx-auto text-muted-foreground">
              Profile Image
              {/* <span className="text-primary"> *</span> */}
            </h4>
            <div className="flex items-center gap-4">
              <div className="relative">
                {profileImage && !profileImageError ? (
                  <div className="relative h-24 w-24">
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      onError={() => setProfileImageError(true)}
                      className="h-24 w-24 rounded-full object-cover border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue('profileImage', '', {
                          shouldValidate: true,
                        });
                        profileImageFileRef.current = null;
                        setProfileImageError(false);
                        if (profileInputRef.current) {
                          profileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow-sm"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-background hover:border-primary"
                  >
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </button>
                )}
              </div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {profileImage && !profileImageError
                    ? 'Click image to change'
                    : 'Upload profile image'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                {errors.profileImage && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.profileImage.message}
                  </p>
                )}
              </div>
            </div>
          </div>

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
                {/* <span className="text-primary"> *</span> */}
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
      );
    }
    if (currentStep === 3) {
      return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <ReviewCard
            sections={[
              {
                icon: <User className="h-5 w-5 text-white" />,
                title: 'Customer Information',
                subtitle:
                  'Please verify the customer information below',
                imageFields: formValues.profileImage
                  ? [
                      {
                        label: 'Profile Image',
                        src: formValues.profileImage,
                        alt: `${formValues.firstName} ${formValues.lastName}`,
                      },
                    ]
                  : undefined,
                fields: [
                  {
                    icon: <User className="h-3 w-3" />,
                    label: 'First Name',
                    value: formValues.firstName,
                  },
                  {
                    icon: <User className="h-3 w-3" />,
                    label: 'Last Name',
                    value: formValues.lastName,
                  },
                  ...(formValues.email
                    ? [
                        {
                          icon: <Mail className="h-3 w-3" />,
                          label: 'Email',
                          value: formValues.email,
                        },
                      ]
                    : []),
                  {
                    icon: <Phone className="h-3 w-3" />,
                    label: 'Phone Number',
                    value: `${formValues.countryCode} ${formValues.phoneNumber}`,
                  },
                  {
                    icon: <MapPin className="h-3 w-3" />,
                    label: 'Address',
                    value: formValues.address,
                  },
                  ...(formValues.latitude != null &&
                  formValues.longitude != null
                    ? [
                        {
                          icon: <Map className="h-3 w-3" />,
                          label: 'Latitude',
                          value: String(formValues.latitude),
                        },
                        {
                          icon: <Map className="h-3 w-3" />,
                          label: 'Longitude',
                          value: String(formValues.longitude),
                        },
                      ]
                    : [
                        {
                          icon: <Map className="h-3 w-3" />,
                          label: 'Coordinates',
                          value: 'Not provided',
                        },
                      ]),
                ],
              },
            ]}
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
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.CUSTOMERS)}
            className="mb-4 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <Navbar
            title="Add Customer"
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
            submitLabel="Add Customer"
            formRef={formRef}
          >
            {renderStepContent()}
          </AdminFormStepper>
        </div>
      </div>
    </AppLayout>
  );
}
