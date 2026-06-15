import { useState, useRef, useCallback, useEffect } from 'react';
import {
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
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
  ExternalLink,
  Eye,
  Map,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';

import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { ROUTES } from '@/constants';
import {
  useUpdateEmployeeMutation,
  useGetEmployeeByIdQuery,
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
import { PhoneInput } from '@/components/forms/phone-input';
import { LocationModeToggle } from '@/components/forms/location-mode-toggle';
import { GoogleMapPicker } from '@/components/google-maps/picker';
import { ManualCoordinates } from '@/components/forms/manual-coordinates';
import { validatePhone } from '@/lib/phone-validation';

const updateEmployeeSchema = z
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

type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

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

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state: locationState } = useLocation();
  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetEmployeeByIdQuery(id ?? '', { skip: !id });
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<NamedDoc[]>([]);
  const [profileImageError, setProfileImageError] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const profileImageFileRef = useRef<File | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<
    string | null
  >(null);
  const [existingImgErrors, setExistingImgErrors] = useState<
    Set<number>
  >(new Set());
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateEmployeeFormData>({
    mode: 'all',
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      countryCode: '+64',
      address: '',
      profileImage: '',
      latitude: 5.8485,
      longitude: 14.7633,
      locationMode: 'manual',
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (locationState?.employee) {
      const emp = locationState.employee;
      setValue('firstName', emp.firstName ?? '');
      setValue('lastName', emp.lastName ?? '');
      setValue('email', emp.email ?? '');
      setValue('phoneNumber', emp.phoneNumber ?? '');
      setValue('countryCode', emp.countryCode ?? '+64');
      setValue('address', emp.address ?? '');
      setValue('profileImage', emp.profileImage ?? '');
      const coords1 = emp.location?.coordinates;
      setValue('latitude', coords1 ? coords1[1] : 5.8485);
      setValue('longitude', coords1 ? coords1[0] : 14.7633);
      setValue('locationMode', emp.locationMode ?? 'manual');
      if (emp.attachments) {
        setExistingAttachments(emp.attachments);
      }
    } else if (employeeData) {
      const emp = employeeData;
      setValue('firstName', emp.firstName ?? '');
      setValue('lastName', emp.lastName ?? '');
      setValue('email', emp.email ?? '');
      setValue('phoneNumber', emp.phoneNumber ?? '');
      setValue('countryCode', emp.countryCode ?? '+64');
      setValue('address', emp.address ?? '');
      setValue('profileImage', emp.profileImage ?? '');
      const coords2 = emp.location?.coordinates;
      setValue('latitude', coords2 ? coords2[1] : 5.8485);
      setValue('longitude', coords2 ? coords2[0] : 14.7633);
      setValue('locationMode', emp.locationMode ?? 'manual');
      if (emp.attachments) {
        setExistingAttachments(emp.attachments);
      }
    }
  }, [employeeData, locationState, setValue]);

  const handleProfileImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        profileImageFileRef.current = file;
        setProfileImageError(false);
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
    let fieldsToValidate: (keyof UpdateEmployeeFormData)[] = [];

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
        'latitude',
        'longitude',
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
      if (currentStep === 2) setProfileImageError(false);
    }
  };

  const onSubmit = async (data: UpdateEmployeeFormData) => {
    if (!id || id === 'undefined' || id.length < 10) return;
    // console.log('onSubmit lat/lng:', data.latitude, data.longitude);
    try {
      let profileImageUrl = data.profileImage;
      let attachments:
        | Array<{ key: string; value: string }>
        | undefined =
        existingAttachments.length > 0
          ? [...existingAttachments]
          : undefined;

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
        if (!attachments) attachments = [];
        for (const doc of docsToUpload) {
          const fd = new FormData();
          fd.append('file', doc.file!);
          const name = doc.name;
          uploads.push(
            uploadDocument(fd)
              .unwrap()
              .then((res: { file: { url: string } }) => {
                attachments!.push({ key: name, value: res.file.url });
              }),
          );
        }
      }

      await Promise.all(uploads);

      const payload = {
        id,
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
      };
      await updateEmployee(payload).unwrap();
      toast.success('Employee updated successfully');
      navigate(ROUTES.EMPLOYEES);
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        getErrorMessage(error, 'Failed to update employee'),
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
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
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
      const locationMode = formValues.locationMode || 'manual';
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
      const getFileExtensionFromUrl = (url: string) => {
        const clean = url.split('?')[0].split('#')[0];
        return clean.split('.').pop()?.toUpperCase() || 'FILE';
      };

      const isImageExtension = (ext: string) =>
        [
          'PNG',
          'JPG',
          'JPEG',
          'GIF',
          'WEBP',
          'SVG',
          'BMP',
          'ICO',
        ].includes(ext);

      return (
        <div className="space-y-6">
          {existingAttachments.length > 0 && (
            <div>
              <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Existing Documents
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {existingAttachments.map((att, i) => {
                  const ext = getFileExtensionFromUrl(att.value);
                  const isImage = isImageExtension(ext);

                  return (
                    <div
                      key={att.key}
                      className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
                    >
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                        {isImage && !existingImgErrors.has(i) ? (
                          <img
                            src={att.value}
                            alt={att.key}
                            onError={() =>
                              setExistingImgErrors((prev) =>
                                new Set(prev).add(i),
                              )
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gray-50">
                            <FileText className="h-8 w-8 text-gray-500" />
                            <span className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                              {ext}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={att.key}
                            onChange={(e) => {
                              const updated = [
                                ...existingAttachments,
                              ];
                              updated[i] = {
                                ...updated[i],
                                key: e.target.value,
                              };
                              setExistingAttachments(updated);
                            }}
                            className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-sm outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setExistingAttachments(
                                existingAttachments.filter(
                                  (_, idx) => idx !== i,
                                ),
                              );
                              setExistingImgErrors((prev) => {
                                const next = new Set(prev);
                                next.delete(i);
                                return next;
                              });
                            }}
                            className="shrink-0 rounded-full p-1 transition-colors hover:bg-red-100"
                          >
                            <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {isImage ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImageUrl(att.value)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground hover:bg-[#f3f4f6]"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </button>
                          ) : (
                            <a
                              href={att.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground hover:bg-[#f3f4f6]"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <NamedDocumentUpload
            documents={documents}
            onAdd={addDocument}
            onRemove={removeDocument}
            onNameChange={updateDocumentName}
            onFileChange={updateDocumentFile}
          />

          {previewImageUrl && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget)
                  setPreviewImageUrl(null);
              }}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <span className="text-sm font-medium text-foreground truncate">
                    Image Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewImageUrl(null)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <ReviewCard
          sections={[
            {
              icon: <User className="h-5 w-5 text-white" />,
              title: 'Employee Information',
              subtitle:
                'Please verify the employee information below',
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
              attachments: existingAttachments,
            },
          ]}
        />
      </form>
    );
  };

  if (isLoadingEmployee) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">
              Loading employee...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
            title="Edit Employee"
            subtitle="Update employee details"
            showWelcome={false}
          />

          <AdminFormStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => {
              setCurrentStep(step);
              if (step === 1) setProfileImageError(false);
            }}
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
