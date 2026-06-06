import { useState, useRef, useCallback } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import toast from 'react-hot-toast';
import { PhoneInput } from '@/components/forms/phone-input';

import { getErrorMessage } from '@/lib/get-error-message';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Map,
  Hash,
  Globe,
  Camera,
  X,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import {
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useUploadDocumentMutation,
} from '@/API/api';
import { AdminFormStepper } from '@/components/admin/admin-form-stepper';
import { AdminFormStep } from '@/components/admin/admin-form-step';
import { ReviewCard } from '@/components/admin/review-card';
import Loader from '@/components/loader';
import type { ICustomer } from '@/types';
import { validatePhone } from '@/lib/phone-validation';
import {
  validateAddress,
  getCountryIsoFromPhoneCode,
} from '@/lib/address-validation';

const editCustomerSchema = z
  .object({
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
    profileImage: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    locationMode: z.enum(['map', 'manual']),
  })
  .superRefine((data: EditCustomerFormData, ctx: z.RefinementCtx) => {
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

    const iso =
      data.countryIso ||
      getCountryIsoFromPhoneCode(data.countryCode) ||
      '';
    if (iso && data.country) {
      const addrResult = validateAddress(
        iso,
        data.state,
        data.city,
        data.postalCode,
      );
      if (!addrResult.valid && addrResult.error && addrResult.path) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: addrResult.error,
          path: [addrResult.path as any],
        });
      }
    }
  });

type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

const steps = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Customer contact details',
    icon: null,
  },
  {
    id: 2,
    title: 'Location',
    description: 'Address information',
    icon: null,
  },
  {
    id: 3,
    title: 'Review',
    description: 'Verify details',
    icon: null,
  },
];

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // if (!id) {
  //   return (
  //     <AppLayout>
  //       <div className="flex h-full items-center justify-center">
  //         <p className="text-muted-foreground">Invalid customer ID</p>
  //       </div>
  //     </AppLayout>
  //   );
  // }
  const location = useLocation();
  const passedCustomer = location.state?.customer as
    | ICustomer
    | undefined;

  const [currentStep, setCurrentStep] = useState(1);
  const [profileImageError, setProfileImageError] = useState(false);
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const profileImageFileRef = useRef<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data, isLoading: isLoadingCustomer } =
    useGetCustomerByIdQuery(id!);
  const customer = (data as any)?.customer ?? data ?? passedCustomer;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditCustomerFormData>({
    mode: 'all',
    resolver: zodResolver(editCustomerSchema),
    values: customer
      ? {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          countryCode: customer.countryCode,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
          country: customer.country,
          countryIso: (customer as any).countryIso || '',
          location: customer.location?.coordinates
            ? `${customer.location.coordinates[1]}, ${customer.location.coordinates[0]}`
            : '',
          profileImage: customer.profileImage || '',
          latitude:
            customer.latitude ??
            customer.location?.coordinates?.[1] ??
            undefined,
          longitude:
            customer.longitude ??
            customer.location?.coordinates?.[0] ??
            undefined,
          locationMode:
            (customer.latitude ??
              customer.location?.coordinates?.[0]) != null &&
            (customer.longitude ??
              customer.location?.coordinates?.[1]) != null
              ? 'map'
              : 'manual',
        }
      : undefined,
  });

  const formValues = watch();

  const handleProfileImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        profileImageFileRef.current = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          setValue('profileImage', reader.result as string, {
            shouldValidate: true,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue],
  );

  const handleNext = async () => {
    let fieldsToValidate: (keyof EditCustomerFormData)[] = [];

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

  const onSubmit = async (data: EditCustomerFormData) => {
    if (!id) {
      toast.error('Customer ID is missing');
      return;
    }

    try {
      let profileImageUrl = data.profileImage;

      if (profileImageFileRef.current) {
        const fd = new FormData();
        fd.append('file', profileImageFileRef.current);
        const res = await uploadDocument(fd).unwrap();
        profileImageUrl = res.file.url;
      }

      await updateCustomer({
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        profileImage: profileImageUrl,
        latitude: data.latitude != null ? data.latitude : undefined,
        longitude:
          data.longitude != null ? data.longitude : undefined,
      }).unwrap();

      toast.success('Customer updated successfully');
      navigate(ROUTES.CUSTOMERS);
    } catch (error: any) {
      toast.error(
        getErrorMessage(error, 'Failed to update customer'),
      );
    }
  };

  if (isLoadingCustomer) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (!customer) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Customer not found</p>
        </div>
      </AppLayout>
    );
  }

  const renderStepContent = () => {
    if (currentStep === 1) {
      const profileImage = formValues.profileImage;
      return (
        <div className="space-y-6">
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide mx-auto text-muted-foreground">
              Profile Image
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
                  <input
                    placeholder="Enter first name"
                    {...register('firstName')}
                    className="w-full h-12 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring/20"
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
                  <input
                    placeholder="Enter last name"
                    {...register('lastName')}
                    className="w-full h-12 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring/20"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                    <span className="text-primary"> *</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    {...register('email')}
                    className="w-full h-12 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring/20"
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
                    value={formValues.phoneNumber}
                    onChange={(val: string) =>
                      setValue('phoneNumber', val, {
                        shouldValidate: true,
                      })
                    }
                    countryCode={formValues.countryCode}
                    onCountryCodeChange={(code: string) =>
                      setValue('countryCode', code, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.phoneNumber?.message}
                  />
                </div>
              </div>
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
                  {
                    icon: <Mail className="h-3 w-3" />,
                    label: 'Email',
                    value: formValues.email,
                  },
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
                  {
                    icon: <Building2 className="h-3 w-3" />,
                    label: 'City',
                    value: formValues.city,
                  },
                  {
                    icon: <Map className="h-3 w-3" />,
                    label: 'State',
                    value: formValues.state,
                  },
                  {
                    icon: <Hash className="h-3 w-3" />,
                    label: 'Postal Code',
                    value: formValues.postalCode,
                  },
                  {
                    icon: <Globe className="h-3 w-3" />,
                    label: 'Country',
                    value: formValues.country,
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
            title="Edit Customer"
            subtitle="Update customer account details"
            showWelcome={false}
          />

          <AdminFormStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isUpdating}
            isLastStep={currentStep === steps.length}
            isFirstStep={currentStep === 1}
            submitLabel="Save Changes"
            allowStepNavigation
            formRef={formRef}
          >
            {renderStepContent()}
          </AdminFormStepper>
        </div>
      </div>
    </AppLayout>
  );
}
