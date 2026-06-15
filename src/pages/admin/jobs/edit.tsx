import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Users,
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  ArrowLeft,
  User,
  CheckCircle2,
  Briefcase,
  Map,
  Repeat,
  StickyNote,
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
import { GoogleMapPicker } from '@/components/google-maps/picker';
import { ManualCoordinates } from '@/components/forms/manual-coordinates';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  useGetJobByIdQuery,
  useGetCustomersQuery,
  useGetEmployeesQuery,
  useUpdateJobMutation,
} from '@/API/api';
import Loader from '@/components/loader';
import { getErrorMessage } from '@/lib/get-error-message';
import { ReviewCard } from '@/components/admin/review-card';
import { useDebounce } from '@/hooks/use-debounce';

const editJobSchema = z
  .object({
    customer: z.string().min(1, 'Customer is required'),
    employee: z.string().optional(),
    jobAddress: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    locationMode: z.enum(['map', 'manual']),
    sameAsCustomer: z.boolean(),
    jobType: z.string().min(1, 'Job type is required'),
    jobDate: z.string().min(1, 'Job date is required'),
    frequencyValue: z.number().optional(),
    frequencyUnit: z.string().optional(),
    price: z.number().min(0, 'Price must be at least 0'),
    paymentType: z.string().min(1, 'Payment type is required'),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.sameAsCustomer) {
      if (!data.jobAddress || !data.jobAddress.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Job address is required', path: ['jobAddress'] });
      }
    }
  });

type EditJobFormData = z.infer<typeof editJobSchema>;

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

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [customerSearch, setCustomerSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 500);
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 500);

  const { data: jobData, isLoading: isFetching } = useGetJobByIdQuery(
    id ?? '',
    { skip: !id },
  );
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
  const [updateJob, { isLoading: isUpdating }] =
    useUpdateJobMutation();

  const customers = useMemo(() => customersData?.customers ?? [], [customersData]);
  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        _id: c._id,
        label: c.fullName,
        subtitle: c.email,
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
  } = useForm<EditJobFormData>({
    resolver: zodResolver(editJobSchema),
    values: jobData
      ? {
          customer:
            (typeof jobData.customerId === 'object'
              ? jobData.customerId?._id
              : undefined) ?? '',
          employee:
            (typeof jobData.employeeId === 'object'
              ? jobData.employeeId?._id
              : typeof jobData.employeeId === 'string'
                ? jobData.employeeId
                : undefined) ?? '',
          jobAddress: jobData.address ?? '',
          latitude: jobData.location?.coordinates?.[1] ?? undefined,
          longitude: jobData.location?.coordinates?.[0] ?? undefined,
          sameAsCustomer: !jobData.address && !!(
            typeof jobData.customerId === 'object'
              ? jobData.customerId?._id
              : jobData.customerId
          ),
          locationMode: 'map',
          jobType: jobData.jobType ?? '',
          jobDate: jobData.jobDate
            ? jobData.jobDate.split('T')[0]
            : jobData.date
              ? jobData.date.split('T')[0]
              : '',
          frequencyValue: jobData.frequency?.value ?? 1,
          frequencyUnit: jobData.frequency?.unit ?? 'week',
          price: jobData.price ?? 0,
          paymentType: jobData.paymentType ?? '',
          notes: jobData.notes ?? '',
        }
      : undefined,
  });

  const formValues = watch();

  const selectedCustomer = useMemo(
    () => customers.find((c) => c._id === formValues.customer) ?? null,
    [customers, formValues.customer],
  );

  useEffect(() => {
    if (!formValues.sameAsCustomer || !selectedCustomer) return;
    const opts = { shouldDirty: true };
    setValue('jobAddress', selectedCustomer.address || '', opts);
  }, [formValues.customer, formValues.sameAsCustomer, selectedCustomer, setValue]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof EditJobFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = formValues.sameAsCustomer
        ? ['customer']
        : [
            'customer',
            'jobAddress',
          ];
    } else if (currentStep === 2) {
      fieldsToValidate = ['jobType', 'jobDate', 'paymentType', 'price'];
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

  const onSubmit = async (data: EditJobFormData) => {
    if (!id) return;
    try {
      const payload: Record<string, unknown> = {
        customerId: data.customer,
        ...(!formValues.sameAsCustomer
          ? {
              address: data.jobAddress,
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
            }
          : {}),
        jobType: data.jobType,
        jobDate: new Date(data.jobDate).toISOString(),
        paymentType: data.paymentType,
        price: data.price || undefined,
        notes: data.notes || undefined,
        frequency:
          data.jobType === 'recurring' &&
          data.frequencyValue &&
          data.frequencyUnit
            ? {
                value: data.frequencyValue,
                unit: data.frequencyUnit,
              }
            : undefined,
      };
      if (data.employee) {
        payload.employeeId = data.employee;
      }
      await updateJob({ id, ...payload }).unwrap();
      toast.success('Job updated successfully');
      navigate(ROUTES.JOBS_VIEW.replace(':id', id));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update job'));
    }
  };

  if (isFetching) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      </AppLayout>
    );
  }

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
                  onCheckedChange={(v) => setValue('sameAsCustomer', v)}
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

              <LocationModeToggle
                value={formValues.locationMode || 'map'}
                onChange={(mode) => setValue('locationMode', mode)}
              />

              {formValues.locationMode === 'map' ? (
                <GoogleMapPicker
                  latitude={formValues.latitude || 0}
                  longitude={formValues.longitude || 0}
                  onPick={(lat, lng, address) => {
                    setValue('latitude', lat);
                    setValue('longitude', lng);
                    if (address) setValue('jobAddress', address, { shouldValidate: true, shouldDirty: true });
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
                  variant="responsive"
                  onSearch={setCustomerSearch}
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
                  variant="responsive"
                  error={errors.employee?.message}
                  onSearch={setEmployeeSearch}
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
    const customerName = selectedCustomer?.fullName ?? formValues.customer;
    const employeeName = formValues.employee
      ? employeeOptions.find((e) => e._id === formValues.employee)?.label ?? formValues.employee
      : null;
    const jobTypeLabel = formValues.jobType === 'one_time' ? 'One Time' : formValues.jobType === 'recurring' ? 'Recurring' : '-';
    const paymentTypeLabel = formValues.paymentType
      ? { bank_transfer: 'Bank Transfer', cash: 'Cash', drop_invoice: 'Drop Invoice' }[formValues.paymentType] ?? formValues.paymentType
      : '-';

    const customerLocationFields = [
      { icon: <User className="h-3 w-3" />, label: 'Customer', value: customerName },
      ...(employeeName ? [{ icon: <Briefcase className="h-3 w-3" />, label: 'Employee', value: employeeName }] : []),
      ...(!formValues.sameAsCustomer
        ? [
            { icon: <MapPin className="h-3 w-3" />, label: 'Address', value: formValues.jobAddress || '-' },
            ...(formValues.latitude && formValues.longitude
              ? [{ icon: <Map className="h-3 w-3" />, label: 'Coordinates', value: `${formValues.latitude.toFixed(6)}, ${formValues.longitude.toFixed(6)}` }]
              : []),
          ]
        : []),
    ];

    const scheduleFields = [
      { icon: <Briefcase className="h-3 w-3" />, label: 'Job Type', value: jobTypeLabel },
      { icon: <Calendar className="h-3 w-3" />, label: 'Job Date', value: formValues.jobDate || '-' },
      ...(formValues.jobType === 'recurring' && formValues.frequencyValue
        ? [{ icon: <Repeat className="h-3 w-3" />, label: 'Frequency', value: `Every ${formValues.frequencyValue} ${formValues.frequencyUnit}${formValues.frequencyValue && formValues.frequencyValue > 1 ? 's' : ''}` }]
        : []),
      { icon: <CreditCard className="h-3 w-3" />, label: 'Payment Type', value: paymentTypeLabel },
      { icon: <DollarSign className="h-3 w-3" />, label: 'Price', value: `$${formValues.price || '0.00'}` },
      ...(formValues.notes ? [{ icon: <StickyNote className="h-3 w-3" />, label: 'Notes', value: formValues.notes }] : []),
    ];

    return (
      <ReviewCard
        sections={[
          {
            icon: <Users className="h-5 w-5 text-white" />,
            title: 'Customer & Location',
            subtitle: 'Please verify the customer and location details below',
            fields: customerLocationFields,
          },
          {
            icon: <DollarSign className="h-5 w-5 text-white" />,
            title: 'Schedule & Pricing',
            subtitle: 'Please verify the schedule and pricing details below',
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
              title="Edit Job"
              subtitle="Update job details and assignment."
              showWelcome={false}
            />

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
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
                isSubmitting={isUpdating}
                isLastStep={currentStep === steps.length}
                isFirstStep={currentStep === 1}
                submitLabel="Save Changes"
                allowStepNavigation
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
