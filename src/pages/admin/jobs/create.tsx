import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Users,
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  User,
  Briefcase,
  MapPin,
  Building2,
  Map,
  Hash,
  Globe,
  Calendar,
  Repeat,
  CreditCard,

  StickyNote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Country } from 'country-state-city';

import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { ROUTES } from '@/constants';
import { AdminFormStepper } from '@/components/admin/admin-form-stepper';
import { ReviewCard } from '@/components/admin/review-card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { useDebounce } from '@/hooks/use-debounce';

const createJobSchema = z
  .object({
    customer: z.string().min(1, 'Customer is required'),
    employee: z.string().optional(),
    jobAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
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
    notes: z.string().optional(),
    sameAsCustomer: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.sameAsCustomer) {
      if (!data.jobAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Job address is required',
          path: ['jobAddress'],
        });
      }
      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'City is required',
          path: ['city'],
        });
      }
      if (!data.state) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'State is required',
          path: ['state'],
        });
      }
      if (!data.country) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Country is required',
          path: ['country'],
        });
      }
      if (!data.postalCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Postal code is required',
          path: ['postalCode'],
        });
      }
    }
    if (!data.sameAsCustomer && data.countryIso) {
      const addrResult = validateAddress(
        data.countryIso,
        data.state || '',
        data.city || '',
        data.postalCode || '',
      );
      if (!addrResult.valid && addrResult.error && addrResult.path) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: addrResult.error,
          path: [addrResult.path],
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
  notes: '',
  sameAsCustomer: false,
};

const steps = [
  {
    id: 1,
    title: 'Customer & Location',
    description: 'Customer, employee & job address',
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: 2,
    title: 'Schedule & Pricing',
    description: 'Job details & payment',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    id: 3,
    title: 'Review & Confirm',
    description: 'Review before submitting',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [createJob, { isLoading: isCreating }] =
    useCreateJobMutation();

  const [customerSearch, setCustomerSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 500);
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 500);

  const { data: customersData } = useGetCustomersQuery({
    limit: 50,
    page: 1,
    search: debouncedCustomerSearch || undefined,
  });
  const { data: employeesData } = useGetEmployeesQuery({
    limit: 50,
    page: 1,
    search: debouncedEmployeeSearch || undefined,
  });

  const customers = useMemo(() => customersData?.customers ?? [], [customersData]);

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        _id: c._id,
        label: c.fullName,
        subtitle: c.email,
        profileImage: c.profileImage,
        countryCode: c.countryCode,
        phoneNumber: c.phoneNumber,
        address: c.address,
        customerId: c.customerId,
      })),
    [customers],
  );

  const employeeOptions = useMemo(
    () =>
      (employeesData?.employees ?? []).map((e) => ({
        _id: e._id,
        label: e.fullName,
        subtitle: e.email,
        profileImage: e.profileImage,
        countryCode: e.countryCode,
        phoneNumber: e.phoneNumber,
        address: e.address,
        employeeId: e.employeeId,
      })),
    [employeesData],
  );

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: initialFormData,
  });

  const formValues = watch();

  const selectedCustomer = useMemo(
    () =>
      customers.find((c) => c._id === formValues.customer) ?? null,
    [customers, formValues.customer],
  );

  useEffect(() => {
    if (!formValues.sameAsCustomer || !selectedCustomer) return;
    const opts = { shouldDirty: true };
    setValue('jobAddress', selectedCustomer.address || '', opts);
    setValue('city', selectedCustomer.city || '', opts);
    setValue('state', selectedCustomer.state || '', opts);
    setValue('country', selectedCustomer.country || '', opts);
    setValue('postalCode', selectedCustomer.postalCode || '', opts);
    const countryRecord = Country.getAllCountries().find(
      (ctry) =>
        ctry.name.toLowerCase() ===
        (selectedCustomer.country || '').toLowerCase(),
    );
    setValue('countryIso', countryRecord?.isoCode ?? '', opts);
    if (selectedCustomer.location?.coordinates) {
      setValue(
        'longitude',
        selectedCustomer.location.coordinates[0],
        opts,
      );
      setValue(
        'latitude',
        selectedCustomer.location.coordinates[1],
        opts,
      );
    } else if (
      selectedCustomer.latitude != null &&
      selectedCustomer.longitude != null
    ) {
      setValue('latitude', selectedCustomer.latitude, opts);
      setValue('longitude', selectedCustomer.longitude, opts);
    }
  }, [formValues.customer, formValues.sameAsCustomer, customers, selectedCustomer, setValue]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateJobFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = formValues.sameAsCustomer
        ? ['customer']
        : [
            'customer',
            'jobAddress',
            'state',
            'city',
            'postalCode',
            'country',
          ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        'jobType',
        'jobDate',
        'paymentType',
        'price',
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

  const onSubmit = async (data: CreateJobFormData) => {
    try {
      if (
        data.customer === 'undefined' ||
        data.employee === 'undefined'
      ) {
        console.error(
          '[createJob] Invalid form state: customer or employee is literal "undefined"',
          { customer: data.customer, employee: data.employee },
        );
        toast.error(
          'Invalid form state. Please re-select the customer/employee and try again.',
        );
        return;
      }
      const employeeId = data.employee;
      const payload: Record<string, unknown> = {
        customerId: data.customer,
        ...(!data.sameAsCustomer
          ? {
              address: data.jobAddress,
              city: data.city || undefined,
              state: data.state || undefined,
              country: data.country || undefined,
              postalCode: data.postalCode || undefined,
              location:
                data.latitude && data.longitude
                  ? ({
                      type: 'Point' as const,
                      coordinates: [
                        data.longitude,
                        data.latitude,
                      ] as [number, number],
                    } as const)
                  : undefined,
            }
          : {}),
        jobType: data.jobType,
        jobDate: new Date(data.jobDate).toISOString(),
        paymentType: data.paymentType,
        price: data.price || undefined,
        notes: data.notes || undefined,
        ...(data.jobType === 'recurring'
          ? {
              frequencyValue: data.frequencyValue,
              frequencyUnit: data.frequencyUnit,
            }
          : {}),
      };
      if (employeeId) {
        payload.employeeId = employeeId;
      }
      // console.debug('[createJob] payload:', payload);
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
          {/* Customer & Employee Section */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Customer & Assignment
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
                  variant="responsive"
                  onSearch={setCustomerSearch}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Select Employee
                </label>
                <SearchableSelect
                  data={employeeOptions}
                  value={formValues.employee || ''}
                  onChange={(v) => setValue('employee', v)}
                  placeholder="Choose an employee"
                  searchPlaceholder="Search employees..."
                  loading={!employeesData}
                  variant="responsive"
                  error={errors.employee?.message}
                  onSearch={setEmployeeSearch}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Job Location
            </h4>
            <div className="space-y-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch
                  checked={formValues.sameAsCustomer || false}
                  onCheckedChange={(v) =>
                    setValue('sameAsCustomer', v)
                  }
                  disabled={!selectedCustomer}
                  size="default"
                />
                <span className="text-sm font-medium text-foreground">
                  Same as Customer Address
                </span>
              </label>

              {!formValues.sameAsCustomer && (
                <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Address
                  <span className="text-primary"> *</span>
                </label>
                <Controller
                  name="jobAddress"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Enter job address"
                      {...field}
                      className="min-h-[80px] rounded-xl border-border bg-background p-4"
                    />
                  )}
                />
                {errors.jobAddress && (
                  <p className="text-sm text-red-500">
                    {errors.jobAddress.message}
                  </p>
                )}
              </div>

              <AddressInputs
                countryIso={formValues.countryIso || ''}
                country={formValues.country || ''}
                state={formValues.state || ''}
                city={formValues.city || ''}
                postalCode={formValues.postalCode || ''}
                onCountryChange={(name, iso) => {
                  setValue('country', name, {
                    shouldValidate: true,
                  });
                  setValue('countryIso', iso, {
                    shouldValidate: true,
                  });
                  setValue('state', '', { shouldValidate: true });
                  setValue('city', '', { shouldValidate: true });
                }}
                onStateChange={(name) => {
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
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-8">
          {/* Schedule Section */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Schedule
            </h4>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

          {/* Pricing Section */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Pricing
            </h4>
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
          </div>

          {/* Description & Notes Section */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Additional Details
            </h4>
            <div className="space-y-5">
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
    }

    // Step 3: Review & Confirm
    const customerName =
      selectedCustomer?.fullName ?? formValues.customer;
    const employeeName = formValues.employee
      ? (employeeOptions.find((e) => e._id === formValues.employee)
          ?.label ?? formValues.employee)
      : null;
    const jobTypeLabel =
      formValues.jobType === 'one_time'
        ? 'One Time'
        : formValues.jobType === 'recurring'
          ? 'Recurring'
          : '-';
    const paymentTypeLabel = formValues.paymentType
      ? ({
          bank_transfer: 'Bank Transfer',
          cash: 'Cash',
          drop_invoice: 'Drop Invoice',
        }[formValues.paymentType] ?? formValues.paymentType)
      : '-';

    const customerLocationFields = [
      {
        icon: <User className="h-3 w-3" />,
        label: 'Customer',
        value: customerName,
      },
      ...(employeeName
        ? [
            {
              icon: <Briefcase className="h-3 w-3" />,
              label: 'Employee',
              value: employeeName,
            },
          ]
        : []),
      ...(!formValues.sameAsCustomer
        ? [
            {
              icon: <MapPin className="h-3 w-3" />,
              label: 'Address',
              value: formValues.jobAddress || '-',
            },
            {
              icon: <Building2 className="h-3 w-3" />,
              label: 'City',
              value: formValues.city || '-',
            },
            {
              icon: <Map className="h-3 w-3" />,
              label: 'State',
              value: formValues.state || '-',
            },
            {
              icon: <Globe className="h-3 w-3" />,
              label: 'Country',
              value: formValues.country || '-',
            },
            {
              icon: <Hash className="h-3 w-3" />,
              label: 'Postal Code',
              value: formValues.postalCode || '-',
            },
            ...(formValues.latitude && formValues.longitude
              ? [
                  {
                    icon: <Map className="h-3 w-3" />,
                    label: 'Coordinates',
                    value: `${formValues.latitude.toFixed(6)}, ${formValues.longitude.toFixed(6)}`,
                  },
                ]
              : []),
          ]
        : []),
    ];

    const scheduleFields = [
      {
        icon: <Briefcase className="h-3 w-3" />,
        label: 'Job Type',
        value: jobTypeLabel,
      },
      {
        icon: <Calendar className="h-3 w-3" />,
        label: 'Job Date',
        value: formValues.jobDate || '-',
      },
      ...(formValues.jobType === 'recurring' &&
      formValues.frequencyValue
        ? [
            {
              icon: <Repeat className="h-3 w-3" />,
              label: 'Frequency',
              value: `Every ${formValues.frequencyValue} ${formValues.frequencyUnit}${formValues.frequencyValue && formValues.frequencyValue > 1 ? 's' : ''}`,
            },
          ]
        : []),
      {
        icon: <CreditCard className="h-3 w-3" />,
        label: 'Payment Type',
        value: paymentTypeLabel,
      },
      {
        icon: <DollarSign className="h-3 w-3" />,
        label: 'Price',
        value: `$${formValues.price || '0.00'}`,
      },
      ...(formValues.notes
        ? [
            {
              icon: <StickyNote className="h-3 w-3" />,
              label: 'Notes',
              value: formValues.notes,
            },
          ]
        : []),
    ];

    return (
      <ReviewCard
        sections={[
          {
            icon: <Users className="h-5 w-5 text-white" />,
            title: 'Customer & Location',
            subtitle:
              'Please verify the customer and location details below',
            fields: customerLocationFields,
          },
          {
            icon: <DollarSign className="h-5 w-5 text-white" />,
            title: 'Schedule & Pricing',
            subtitle:
              'Please verify the schedule and pricing details below',
            fields: scheduleFields,
          },
        ]}
      />
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
