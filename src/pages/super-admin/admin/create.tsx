import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Mail,
  MapPin,
  Check,
  ArrowLeft,
  Upload,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';

import { SuperAdminLayout } from '@/components/layout/super-layout';
import { Navbar } from '@/components/layout/navbar';
import { ROUTES } from '@/constants';
import {
  useCreateAdminUserMutation,
  useUploadDocumentMutation,
} from '@/API/api';
import { Input } from '@/components/ui/input';
import { AdminFormStepper } from '@/components/admin/admin-form-stepper';
import { AdminFormStep } from '@/components/admin/admin-form-step';
import { AdminReviewCard } from '@/components/admin/admin-review-card';
import { Button } from '@/components/ui/button';
import { validatePhone } from '@/lib/phone-validation';
import { validateAddress, getCountryIsoFromPhoneCode } from '@/lib/address-validation';

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
  companyName: z.string().min(1, 'Company name is required'),
  gstNumber: z.string().min(1, 'GST number is required'),
  bankAccountNumber: z
    .string()
    .min(1, 'Bank account number is required'),
  profileImage: z.string(),
  invoiceLogo: z.string(),
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

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

const initialFormData: CreateAdminFormData = {
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
  companyName: '',
  gstNumber: '',
  bankAccountNumber: '',
  profileImage: '',
  invoiceLogo: '',
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
    title: 'Company Details',
    description: 'Business information',
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: 4,
    title: 'Review',
    description: 'Verify details',
    icon: <Check className="h-4 w-4" />,
  },
];

export default function CreateAdminPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [createAdmin, { isLoading }] = useCreateAdminUserMutation();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    mode: 'onTouched',
    resolver: zodResolver(createAdminSchema),
    defaultValues: initialFormData,
  });

  const formValues = watch();
  const [profileImageFile, setProfileImageFile] =
    useState<File | null>(null);
  const [invoiceLogoFile, setInvoiceLogoFile] =
    useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] =
    useState<string>('');
  const [invoiceLogoPreview, setInvoiceLogoPreview] =
    useState<string>('');

  const handleProfileImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setProfileImageFile(file);
        const preview = URL.createObjectURL(file);
        setProfileImagePreview(preview);
        setValue('profileImage', preview);
      }
    },
    [setValue],
  );

  const handleInvoiceLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setInvoiceLogoFile(file);
        const preview = URL.createObjectURL(file);
        setInvoiceLogoPreview(preview);
        setValue('invoiceLogo', preview);
      }
    },
    [setValue],
  );

  useEffect(() => {
    return () => {
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
      if (invoiceLogoPreview) URL.revokeObjectURL(invoiceLogoPreview);
    };
  }, [profileImagePreview, invoiceLogoPreview]);

  const [uploadDocument] = useUploadDocumentMutation();

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

    if (currentStep === 3) {
      fieldsToValidate = [
        'companyName',
        'gstNumber',
        'bankAccountNumber',
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
      let profileImageUrl = '';
      let invoiceLogoUrl = '';

      if (profileImageFile) {
        const fd = new FormData();
        fd.append('files', profileImageFile);
        const res = await uploadDocument(fd).unwrap();
        profileImageUrl = res.urls[0];
      }

      if (invoiceLogoFile) {
        const fd = new FormData();
        fd.append('files', invoiceLogoFile);
        const res = await uploadDocument(fd).unwrap();
        invoiceLogoUrl = res.urls[0];
      }

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
        companyName: data.companyName,
        gstNumber: data.gstNumber,
        bankAccountNumber: data.bankAccountNumber,
        profileImage: profileImageUrl,
        invoiceLogo: invoiceLogoUrl,
        location: {
          type: 'Point',
          coordinates: [data.longitude, data.latitude],
        },
      }).unwrap();

      toast.success('Admin created successfully');
      navigate(ROUTES.SUPER_ADMIN_ADMINS);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create admin'));
    }
  };

  const renderStepContent = () => {
    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#777]">
            Company Details
          </h4>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Company Name
                <span className="text-[#16610E]"> *</span>
              </label>
              <Input
                placeholder="Enter company name"
                {...register('companyName')}
                className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                GST Number
                <span className="text-[#16610E]"> *</span>
              </label>
              <Input
                placeholder="Enter GST number"
                {...register('gstNumber')}
                className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
              />
              {errors.gstNumber && (
                <p className="text-sm text-red-500">
                  {errors.gstNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Bank Account Number
                <span className="text-[#16610E]"> *</span>
              </label>
              <Input
                placeholder="Enter bank account number"
                {...register('bankAccountNumber')}
                className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafaf8]"
              />
              {errors.bankAccountNumber && (
                <p className="text-sm text-red-500">
                  {errors.bankAccountNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Profile Image
                <span className="text-[#16610E]"> *</span>
              </label>
              <div className="flex items-center gap-4">
                {profileImagePreview && (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e5e5e5] bg-[#fafaf8] text-sm text-[#151515] hover:bg-[#edf8e7]">
                  <Upload className="h-4 w-4" />
                  {profileImageFile ? 'Change' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Invoice Logo
                <span className="text-[#16610E]"> *</span>
              </label>
              <div className="flex items-center gap-4">
                {invoiceLogoPreview && (
                  <img
                    src={invoiceLogoPreview}
                    alt="Invoice Logo"
                    className="h-16 w-16 rounded object-cover border"
                  />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e5e5e5] bg-[#fafaf8] text-sm text-[#151515] hover:bg-[#edf8e7]">
                  <Upload className="h-4 w-4" />
                  {invoiceLogoFile ? 'Change' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInvoiceLogoChange}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === steps.length) {
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
            profileImage={formValues.profileImage}
            companyName={formValues.companyName}
            gstNumber={formValues.gstNumber}
            bankAccountNumber={formValues.bankAccountNumber}
            invoiceLogo={formValues.invoiceLogo}
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
    <SuperAdminLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto pl-10 p-5">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_ADMINS)}
            className="mb-4 text-[#777] hover:text-[#16610E] hover:bg-[#edf8e7]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admins
          </Button>
          <Navbar
            title="Create Admin"
            subtitle="Add a new administrator account"
            showWelcome={false}
            superAccess
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
            submitLabel="Create Admin"
            formRef={formRef}
          >
            {renderStepContent()}
          </AdminFormStepper>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
