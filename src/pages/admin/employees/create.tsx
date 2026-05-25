import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Mail,
  MapPin,
  FileText,
  Check,
  ArrowLeft,
  X,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';

import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { ROUTES } from '@/constants';
import {
  useCreateEmployeeMutation,
  useUploadDocumentMutation,
} from '@/API/api';
import { AdminFormStepper } from '@/components/admin/admin-form-stepper';
import { AdminReviewCard } from '@/components/admin/admin-review-card';
import {
  NamedDocumentUpload,
  type NamedDoc,
} from '@/components/admin/named-document-upload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LocationModeToggle } from '@/components/forms/location-mode-toggle';
import { GoogleMapPicker } from '@/components/google-maps/picker';
import { ManualCoordinates } from '@/components/forms/manual-coordinates';
import { PhoneInput } from '@/components/forms/phone-input';
import { AddressInputs } from '@/components/forms/address-inputs';
import { validatePhone } from '@/lib/phone-validation';
import { validateAddress, getCountryIsoFromPhoneCode } from '@/lib/address-validation';

const createEmployeeSchema = z
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
    profileImage: z.string().min(1, 'Profile image is required'),
    latitude: z.number(),
    longitude: z.number(),
    locationMode: z.enum(['map', 'manual']),
  })
  .superRefine((data, ctx) => {
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

type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

const steps = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Employee contact details',
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
    title: 'Documents',
    description: 'Upload files',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 4,
    title: 'Review',
    description: 'Verify details',
    icon: <Check className="h-4 w-4" />,
  },
];

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<NamedDoc[]>([]);
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const profileImageFileRef = useRef<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEmployeeFormData>({
    mode: 'all',
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
    countryCode: '+64',
    countryIso: 'NZ',
    address: '',
    city: '',
      state: '',
      postalCode: '',
      country: '',
      profileImage: '',
      latitude: 5.8485,
      longitude: 14.7633,
      locationMode: 'map',
    },
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

  const onFormError = () => {
    toast.error('Please fix all field errors before submitting');
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateEmployeeFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'countryCode',
        'profileImage',
      ];
    }

    if (currentStep === 2) {
      fieldsToValidate = [
        'address',
        'city',
        'state',
        'postalCode',
        'country',
        'countryIso',
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

  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      let profileImageUrl = data.profileImage;
      let attachments: Array<{ key: string; value: string }> | undefined;

      const uploads: Promise<any>[] = [];

      if (profileImageFileRef.current) {
        const fd = new FormData();
        fd.append('file', profileImageFileRef.current);
        uploads.push(
          uploadDocument(fd)
            .unwrap()
            .then((res: any) => {
              profileImageUrl = res.file.url;
            }),
        );
      }

      const docsToUpload = documents.filter((d) => d.file && d.name);
      if (docsToUpload.length > 0) {
        const results: Array<{ key: string; value: string }> = [];
        for (const doc of docsToUpload) {
          const fd = new FormData();
          fd.append('file', doc.file!);
          const name = doc.name;
          uploads.push(
            uploadDocument(fd)
              .unwrap()
              .then((res: any) => {
                results.push({ key: name, value: res.file.url });
              }),
          );
        }
        uploads.push(Promise.resolve().then(() => { attachments = results; }));
      }

      await Promise.all(uploads);

      await createEmployee({
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
        latitude: data.latitude,
        longitude: data.longitude,
        attachments,
      }).unwrap();
      toast.success('Employee created successfully');
      navigate(ROUTES.EMPLOYEES);
    } catch (error: any) {
      toast.error(
        getErrorMessage(error, 'Failed to create employee'),
      );
    }
  };

  const addDocument = () => {
    setDocuments([...documents, { name: '', file: null }]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const updateDocumentName = (index: number, name: string) => {
    setDocuments(
      documents.map((d, i) => (i === index ? { ...d, name } : d)),
    );
  };

  const updateDocumentFile = (index: number, file: File | null) => {
    setDocuments(
      documents.map((d, i) => (i === index ? { ...d, file } : d)),
    );
  };

  const handleCoordinatePick = (lat: number, lng: number) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      const profileImage = formValues.profileImage;
      return (
        <div className="space-y-6">
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide mx-auto text-[#777]">
              Profile Image
              <span className="text-[#16610E]"> *</span>
            </h4>
            <div className="flex items-center gap-4">
              <div className="relative">
                {profileImage ? (
                  <div className="relative h-24 w-24">
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="h-24 w-24 rounded-full object-cover border-2 border-[#e5e5e5]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue('profileImage', '', {
                          shouldValidate: true,
                        });
                        profileImageFileRef.current = null;
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
                    className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#e5e5e5] bg-[#fafaf8] hover:border-[#16610E]"
                  >
                    <Camera className="h-6 w-6 text-[#777]" />
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
                <p className="text-sm font-medium text-[#151515]">
                  {profileImage
                    ? 'Click image to change'
                    : 'Upload profile image'}
                </p>
                <p className="text-xs text-[#777]">
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
              <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#777]">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#151515]">
                    First Name
                    <span className="text-[#16610E]"> *</span>
                  </label>
                  <input
                    placeholder="Enter first name"
                    {...register('firstName')}
                    className="w-full h-12 rounded-xl border border-[#e5e5e5] bg-[#fafaf8] px-3 text-sm outline-none focus:border-[#16610E] focus:ring-1 focus:ring-[#16610E]/20"
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
                  <input
                    placeholder="Enter last name"
                    {...register('lastName')}
                    className="w-full h-12 rounded-xl border border-[#e5e5e5] bg-[#fafaf8] px-3 text-sm outline-none focus:border-[#16610E] focus:ring-1 focus:ring-[#16610E]/20"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#151515]">
                    Email
                    <span className="text-[#16610E]"> *</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    {...register('email')}
                    className="w-full h-12 rounded-xl border border-[#e5e5e5] bg-[#fafaf8] px-3 text-sm outline-none focus:border-[#16610E] focus:ring-1 focus:ring-[#16610E]/20"
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
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      const locationMode = formValues.locationMode || 'map';
      const latitude = formValues.latitude || 0;
      const longitude = formValues.longitude || 0;

      return (
        <div className="space-y-6">
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#777]">
              Address Information
            </h4>
            <div className="space-y-5">
              <LocationModeToggle
                value={locationMode}
                onChange={(mode) => setValue('locationMode', mode)}
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
                countryIso={formValues.countryIso || ''}
                country={formValues.country}
                state={formValues.state}
                city={formValues.city}
                postalCode={formValues.postalCode}
                onCountryChange={(name, iso) => {
                  setValue('country', name, { shouldValidate: true });
                  setValue('countryIso', iso, { shouldValidate: true });
                  setValue('state', '', { shouldValidate: true });
                  setValue('city', '', { shouldValidate: true });
                }}
                onStateChange={(name, _iso) => {
                  setValue('state', name, { shouldValidate: true });
                  setValue('city', '', { shouldValidate: true });
                }}
                onCityChange={(name) =>
                  setValue('city', name, { shouldValidate: true })
                }
                onPostalCodeChange={(val) =>
                  setValue('postalCode', val, { shouldValidate: true })
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

    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <NamedDocumentUpload
            documents={documents}
            onAdd={addDocument}
            onRemove={removeDocument}
            onNameChange={updateDocumentName}
            onFileChange={updateDocumentFile}
          />
        </div>
      );
    }

    return (
      <form ref={formRef} onSubmit={handleSubmit(onSubmit, onFormError)}>
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
          profileImage={formValues.profileImage}
          latitude={formValues.latitude}
          longitude={formValues.longitude}
          documents={documents}
        />
      </form>
    );
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto pl-10 p-5">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.EMPLOYEES)}
            className="mb-4 text-[#777] hover:text-[#16610E] hover:bg-[#edf8e7]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
          <Navbar
            title="Create Employee"
            subtitle="Add a new employee account"
            showWelcome={false}
          />

          <AdminFormStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit(onSubmit, onFormError)}
            isSubmitting={isCreating}
            isLastStep={currentStep === steps.length}
            isFirstStep={currentStep === 1}
            submitLabel="Create Employee"
            formRef={formRef}
          >
            {renderStepContent()}
          </AdminFormStepper>
        </div>
      </div>
    </AppLayout>
  );
}
