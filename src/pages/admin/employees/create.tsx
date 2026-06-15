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
  User,
  Phone,
  Map,
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
import { ReviewCard } from '@/components/admin/review-card';
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
import { validatePhone } from '@/lib/phone-validation';

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
    profileImage: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    locationMode: z.enum(['map', 'manual']),
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

type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

const initialFormData: CreateEmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  countryCode: '+64',
  address: '',
  profileImage: '',
  latitude: 5.8485,
  longitude: 14.7633,
  locationMode: 'map',
};
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

  const [profileImageError, setProfileImageError] = useState(false);

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
    defaultValues: initialFormData,
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
        // 'countryCode',
        // 'profileImage',
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

  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      let profileImageUrl = data.profileImage;
      let attachments:
        | Array<{ key: string; value: string }>
        | undefined;

      const uploads: Promise<void>[] = [];

      if (profileImageFileRef.current) {
        const fd = new FormData();
        fd.append('file', profileImageFileRef.current);
        uploads.push(
          uploadDocument(fd)
            .unwrap()
            .then((res: { file: { url: string } }) => {
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
              .then((res: { file: { url: string } }) => {
                results.push({ key: name, value: res.file.url });
              }),
          );
        }
        uploads.push(
          Promise.resolve().then(() => {
            attachments = results;
          }),
        );
      }

      await Promise.all(uploads);

      await createEmployee({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        address: data.address,
        profileImage: profileImageUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        attachments,
      }).unwrap();
      toast.success('Employee created successfully');
      navigate(ROUTES.EMPLOYEES);
    } catch (error: unknown) {
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

  const handleCoordinatePick = (lat: number, lng: number, address?: string) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
    if (address) {
      setValue('address', address, { shouldValidate: true, shouldDirty: true });
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      const profileImage = formValues.profileImage;
      return (
        <div className="space-y-6">
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
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit, onFormError)}
      >
        <ReviewCard
          sections={[
            {
              icon: <User className="h-5 w-5 text-white" />,
              title: 'Employee Information',
              subtitle: 'Please verify the employee information below',
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
              documents,
            },
          ]}
        />
      </form>
    );
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.EMPLOYEES)}
            className="mb-4 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
          <Navbar
            title="Add Employee"
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
            submitLabel="Add Employee"
            formRef={formRef}
          >
            {renderStepContent()}
          </AdminFormStepper>
        </div>
      </div>
    </AppLayout>
  );
}
