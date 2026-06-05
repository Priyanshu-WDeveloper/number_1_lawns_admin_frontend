import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Users,
  MapPin,
  CreditCard,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { ROUTES } from '@/constants';
import { AdminFormStepper } from '@/components/admin/admin-form-stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationModeToggle } from '@/components/forms/location-mode-toggle';
import { ManualCoordinates } from '@/components/forms/manual-coordinates';
import { GoogleMapPicker } from '@/components/google-maps/picker';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  useCreateJobMutation,
  useGetCustomersQuery,
  useGetEmployeesQuery,
} from '@/API/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { AddressInputs } from '@/components/forms/address-inputs';
import { validateAddress } from '@/lib/address-validation';

const createJobSchema = z
  .object({
    customer: z.string().min(1, 'Customer is required'),
    employee: z.string().optional(),
    jobAddress: z.string().min(1, 'Job address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    countryIso: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    locationMode: z.enum(['map', 'manual']),
    jobType: z.string().min(1, 'Job type is required'),
    jobDate: z.string().min(1, 'Job date is required'),
    frequencyValue: z.number().optional(),
    frequencyUnit: z.string().optional(),
    price: z.number().min(0, 'Price must be at least 0'),
    paymentType: z.string().min(1, 'Payment type is required'),
    description: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.countryIso) {
      const addrResult = validateAddress(
        data.countryIso,
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

type CreateJobFormData = z.infer<typeof createJobSchema>;

const initialFormData: CreateJobFormData = {
  customer: '',
  employee: '',
  jobAddress: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  countryIso: '',
  latitude: undefined,
  longitude: undefined,
  locationMode: 'map',
  jobType: '',
  frequencyValue: 1,
  frequencyUnit: 'week',
  price: 0,
  paymentType: '',
  jobDate: '',
  description: '',
  notes: '',
};

const steps = [
  {
    id: 1,
    title: 'Location',
    description: 'Job address & map',
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    id: 2,
    title: 'Assignment & Schedule',
    description: 'Customer, type & date',
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: 3,
    title: 'Payment',
    description: 'Payment details',
    icon: <CreditCard className="h-4 w-4" />,
  },
];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [createJob, { isLoading: isCreating }] =
    useCreateJobMutation();

  const { data: customersData } = useGetCustomersQuery({
    limit: 500,
    page: 1,
  });
  const { data: employeesData } = useGetEmployeesQuery({
    limit: 500,
    page: 1,
  });

  const customerOptions = useMemo(
    () =>
      (customersData?.customers ?? []).map((c) => ({
        _id: c._id,
        label: c.fullName,
        subtitle: c.email,
      })),
    [customersData],
  );

  const employeeOptions = useMemo(
    () =>
      (employeesData?.employees ?? []).map((e) => ({
        _id: e._id,
        label: e.fullName,
        subtitle: e.email,
      })),
    [employeesData],
  );

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: initialFormData,
  });

  const formValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateJobFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        'locationMode',
        'jobAddress',
        'state',
        'city',
        'postalCode',
        'country',
        'countryIso',
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = ['customer', 'jobType', 'jobDate'];
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

  const onSubmit = async (data: CreateJobFormData) => {
    try {
      const payload: Record<string, unknown> = {
        customerId: data.customer,
        address: data.jobAddress,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        postalCode: data.postalCode || undefined,
        jobType: data.jobType,
        jobDate: new Date(data.jobDate).toISOString(),
        paymentType: data.paymentType,
        price: data.price || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
        location:
          data.latitude && data.longitude
            ? ({
                type: 'Point' as const,
                coordinates: [data.longitude, data.latitude] as [
                  number,
                  number,
                ],
              } as const)
            : undefined,
        // frequency:
        // data.jobType === 'recurring' && data.frequencyValue && data.frequencyUnit ? {
        //       value: data.frequencyValue,
        //       unit: data.frequencyUnit,
        //     }
        ...(data.jobType === 'recurring'
          ? {
              frequencyValue: data.frequencyValue,
              frequencyUnit: data.frequencyUnit,
            }
          : {}),
      };
      if (data.employee) {
        payload.employeeId = data.employee;
      }
      await createJob(payload).unwrap();
      toast.success('Job created successfully');
      navigate(ROUTES.JOBS);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create job'));
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-8">
          {/* Location Section */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Job Location
            </h4>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Address
                  <span className="text-primary"> *</span>
                </label>
                <Textarea
                  placeholder="Enter job address"
                  {...register('jobAddress')}
                  className="min-h-[80px] rounded-xl border-border bg-background p-4"
                />
                {errors.jobAddress && (
                  <p className="text-sm text-red-500">
                    {errors.jobAddress.message}
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
                  setValue('countryIso', iso, {
                    shouldValidate: true,
                  });
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
                  setValue('postalCode', val, {
                    shouldValidate: true,
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
                value={formValues.locationMode || 'map'}
                onChange={(mode) => setValue('locationMode', mode)}
              />

              {formValues.locationMode === 'map' ? (
                <GoogleMapPicker
                  latitude={formValues.latitude || 0}
                  longitude={formValues.longitude || 0}
                  onPick={(lat, lng) => {
                    setValue('latitude', lat);
                    setValue('longitude', lng);
                  }}
                />
              ) : (
                <ManualCoordinates
                  latitude={formValues.latitude || 0}
                  longitude={formValues.longitude || 0}
                  onChange={(lat, lng) => {
                    setValue('latitude', lat);
                    setValue('longitude', lng);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-8">
          {/* Assignment & Schedule Section */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Job Assignment & Schedule
            </h4>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Select Customer
                  <span className="text-primary"> *</span>
                </label>
                <SearchableSelect
                  data={customerOptions}
                  value={formValues.customer || ''}
                  onChange={(v) => setValue('customer', v)}
                  placeholder="Choose a customer"
                  searchPlaceholder="Search customers..."
                  loading={!customersData}
                  error={errors.customer?.message}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Select Employee
                  <span className="text-[#9ca3af] text-xs ml-1">
                    (Optional)
                  </span>
                </label>
                <SearchableSelect
                  data={employeeOptions}
                  value={formValues.employee || ''}
                  onChange={(v) => setValue('employee', v)}
                  placeholder="Choose an employee"
                  searchPlaceholder="Search employees..."
                  loading={!employeesData}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Type
                  <span className="text-primary"> *</span>
                </label>
                <Select
                  value={formValues.jobType || ''}
                  onValueChange={(v) => setValue('jobType', v)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="recurring">
                      Recurring
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.jobType && (
                  <p className="text-sm text-red-500">
                    {errors.jobType.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Date
                  <span className="text-primary"> *</span>
                </label>
                <DatePicker
                  value={formValues.jobDate}
                  onChange={(v) => setValue('jobDate', v)}
                  error={errors.jobDate?.message}
                  placeholder="Select job date"
                />
              </div>

              {formValues.jobType === 'recurring' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Frequency Value
                    </label>
                    <Input
                      type="number"
                      min={1}
                      {...register('frequencyValue', {
                        valueAsNumber: true,
                      })}
                      className="h-12 rounded-xl border-border bg-background [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Frequency Unit
                    </label>
                    <Select
                      value={formValues.frequencyUnit || ''}
                      onValueChange={(v) =>
                        setValue('frequencyUnit', v)
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Payment
          </h4>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Payment Type
                  <span className="text-primary"> *</span>
                </label>
                <Select
                  value={formValues.paymentType || ''}
                  onValueChange={(v) => setValue('paymentType', v)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="bank_transfer">
                      Bank Transfer
                    </SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="drop_invoice">
                      Drop Invoice
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentType && (
                  <p className="text-sm text-red-500">
                    {errors.paymentType.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Price
                  <span className="text-primary"> *</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                    className="h-12 rounded-xl border-border bg-background pl-10"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                placeholder="Enter job description..."
                {...register('description')}
                className="min-h-[80px] rounded-xl border-border bg-background p-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Notes
              </label>
              <Textarea
                placeholder="Add any additional notes..."
                {...register('notes')}
                className="min-h-[100px] rounded-xl border-border bg-background p-4"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <div className="flex w-full flex-col">
            <Navbar
              title="Create Job"
              subtitle="Add a new job and assign customer & employee."
              showWelcome={false}
            />

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.JOBS)}
                className="text-[#6b7280] hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </div>

            <div className="mt-6">
              <AdminFormStepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isCreating}
                isLastStep={currentStep === steps.length}
                isFirstStep={currentStep === 1}
                submitLabel="Create Job"
              >
                <form>{renderStepContent()}</form>
              </AdminFormStepper>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
