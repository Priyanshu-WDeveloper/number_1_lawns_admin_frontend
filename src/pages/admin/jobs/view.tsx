import { useState, useMemo } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  RefreshCw,
  DollarSign,
  Ban,
  Check,
  FileDown,
  Pencil,
  Mail,
  Phone,
  MoreVertical,
  FileText,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { StaticMap } from '@/components/google-maps/static-map';
import { StatusBadge } from '@/components/data-table/status-badge';
import Loader from '@/components/loader';
import { STATUS_CONFIG } from '@/constants/status-config';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CompleteJobDialog } from '@/components/admin/complete-job-dialog';
import {
  useGetJobByIdQuery,
  useCancelJobMutation,
  useCompleteJobMutation,
  useGetJobReceiptQuery,
  useAssignJobEmployeeMutation,
  useGetEmployeesQuery,
} from '@/API/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { formatDate } from '@/lib/format-date';
import type { IJob } from '@/types';

function getCustomerName(customer: IJob['customerId']): string {
  if (typeof customer === 'object' && customer) {
    return (
      customer.fullName ||
      `${customer.firstName} ${customer.lastName}`
    );
  }
  return (customer as string) || '-';
}

function getCustomerEmail(customer: IJob['customerId']): string {
  if (typeof customer === 'object' && customer) return customer.email;
  return '-';
}

function getCustomerPhone(customer: IJob['customerId']): string {
  if (typeof customer === 'object' && customer)
    return customer.phoneNumber;
  return '-';
}

function getEmployeeName(employee: IJob['employeeId']): string {
  if (typeof employee === 'object' && employee) {
    return (
      employee.fullName ||
      `${employee.firstName} ${employee.lastName}`
    );
  }
  return (employee as string) || '-';
}

function getEmployeeEmail(employee: IJob['employeeId']): string {
  if (typeof employee === 'object' && employee) return employee.email;
  return '-';
}

function getEmployeePhone(employee: IJob['employeeId']): string {
  if (typeof employee === 'object' && employee)
    return employee.phoneNumber;
  return '-';
}

function getEmployeeCode(employee: IJob['employeeId']): string {
  if (
    typeof employee === 'object' &&
    employee &&
    employee.employeeId
  ) {
    return employee.employeeId;
  }
  return (typeof employee === 'string' ? employee : '') || '-';
}

export default function JobViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedJob = (location.state as { job?: IJob })?.job;
  const {
    data: job,
    isLoading,
    isError,
  } = useGetJobByIdQuery(id ?? '', {
    skip: !id,
  });

  const [cancelJob] = useCancelJobMutation();
  const [completeJob] = useCompleteJobMutation();
  const { data: receiptData } = useGetJobReceiptQuery(id ?? '', {
    skip: !id,
  });
  const [assignJobEmployee] = useAssignJobEmployeeMutation();
  const { data: employeesData } = useGetEmployeesQuery({
    limit: 500,
    page: 1,
  });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const employeeOptions = useMemo(
    () =>
      (employeesData?.employees ?? []).map((e) => ({
        _id: e._id,
        label: e.fullName,
        subtitle: e.email,
      })),
    [employeesData],
  );

  const resolvedJob = job ?? passedJob;
  if (!resolvedJob) return null;

  const handleConfirmCancel = async () => {
    if (!id) return;
    try {
      await cancelJob({ jobId: id }).unwrap();
      toast.success('Job cancelled successfully');
      setCancelDialogOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel job'));
    }
  };

  const handleAssignEmployee = async () => {
    if (!id || !selectedEmployee) return;
    try {
      await assignJobEmployee({
        id,
        employee: selectedEmployee,
      }).unwrap();
      toast.success('Employee assigned successfully');
      setAssignDialogOpen(false);
      setSelectedEmployee('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to assign employee'));
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (isError || !resolvedJob) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-[#6b7280]">Job not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto pl-10 p-5">
          <div className="mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.JOBS)}
              className="mb-4 text-[#777] hover:text-[#16610E] hover:bg-[#edf8e7]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>

            {/* Header Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-[#16610E]/10 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-[#16610E]" />
                  </div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#151515]">
                      Job
                    </h1>

                    <StatusBadge
                      status={resolvedJob.status ?? ''}
                      config={STATUS_CONFIG.job}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-right">
                    <div className="mt-2">
                      <span className="text-lg font-semibold text-[#16610E]">
                        {resolvedJob.price != null &&
                        resolvedJob.price > 0
                          ? `$${resolvedJob.price}`
                          : 'No Charge'}
                      </span>
                      <p className="text-xs text-[#777]">Price</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-xl">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 rounded-2xl"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(
                            ROUTES.JOBS_EDIT.replace(
                              ':id',
                              resolvedJob._id ?? '',
                            ),
                          )
                        }
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                        Edit Job
                      </DropdownMenuItem>
                      {resolvedJob.status === 'pending' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setCompleteDialogOpen(true)
                            }
                            className="cursor-pointer text-green-600 focus:text-green-600"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setCancelDialogOpen(true)}
                            className="cursor-pointer text-red-500 focus:text-red-500"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="mt-4 flex items-center gap-2 border-t border-[#ececec] pt-4">
                {resolvedJob.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9"
                      onClick={() => setCompleteDialogOpen(true)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl h-9"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Cancel Job
                    </Button>
                  </>
                )}
                {(resolvedJob.receiptUrl ||
                  (receiptData as { receiptUrl?: string } | undefined)
                    ?.receiptUrl) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-9"
                    onClick={() =>
                      window.open(
                        resolvedJob.receiptUrl ||
                          (receiptData as { receiptUrl?: string })
                            .receiptUrl ||
                          '',
                        '_blank',
                      )
                    }
                  >
                    <FileDown className="h-4 w-4 mr-1" />
                    Receipt
                  </Button>
                )}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer Details Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <User className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Customer Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[#777] shrink-0" />
                    <div>
                      <p className="text-sm text-[#777]">Name</p>
                      <p className="text-[#151515] font-medium">
                        {getCustomerName(resolvedJob.customerId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Email</p>
                      <p className="text-[#151515] font-medium">
                        {getCustomerEmail(resolvedJob.customerId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Phone</p>
                      <p className="text-[#151515] font-medium">
                        {getCustomerPhone(resolvedJob.customerId)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Employee Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <User className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Assigned Employee
                  </h3>
                </div>
                {typeof resolvedJob.employeeId === 'object' &&
                resolvedJob.employeeId ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-[#777] shrink-0" />
                      <div>
                        <p className="text-[#151515] font-medium">
                          {getEmployeeName(resolvedJob.employeeId)}
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          {getEmployeeCode(resolvedJob.employeeId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[#777]" />
                      <div>
                        <p className="text-sm text-[#777]">Email</p>
                        <p className="text-[#151515] font-medium">
                          {getEmployeeEmail(resolvedJob.employeeId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-[#777]" />
                      <div>
                        <p className="text-sm text-[#777]">Phone</p>
                        <p className="text-[#151515] font-medium">
                          {getEmployeePhone(resolvedJob.employeeId)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-[#777]">
                      No employee assigned yet.
                    </p>
                    <Dialog
                      open={assignDialogOpen}
                      onOpenChange={setAssignDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-[#16610E] hover:bg-[#16610E]/90 text-white rounded-xl">
                          <User className="h-4 w-4 mr-1" />
                          Assign Employee
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Assign Employee</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <SearchableSelect
                            data={employeeOptions}
                            value={selectedEmployee}
                            onChange={setSelectedEmployee}
                            placeholder="Choose an employee"
                            searchPlaceholder="Search employees..."
                            loading={!employeesData}
                          />
                          <Button
                            className="w-full bg-[#16610E] hover:bg-[#16610E]/90 text-white rounded-xl"
                            disabled={!selectedEmployee}
                            onClick={handleAssignEmployee}
                          >
                            Assign
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>

              {/* Schedule Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Schedule
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 text-[#777] shrink-0" />
                    <div>
                      <p className="text-sm text-[#777]">Job Type</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.jobType
                          ? resolvedJob.jobType
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) =>
                                c.toUpperCase(),
                              )
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#777] shrink-0" />
                    <div>
                      <p className="text-sm text-[#777]">Job Date</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.jobDate
                          ? formatDate(resolvedJob.jobDate)
                          : resolvedJob.date
                            ? formatDate(resolvedJob.date)
                            : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Payment
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-[#777] shrink-0" />
                    <div>
                      <p className="text-sm text-[#777]">Price</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.price != null &&
                        resolvedJob.price > 0
                          ? `$${resolvedJob.price}`
                          : 'No Charge'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-[#777] shrink-0" />
                    <div>
                      <p className="text-sm text-[#777]">
                        Payment Type
                      </p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.paymentType
                          ? resolvedJob.paymentType
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) =>
                                c.toUpperCase(),
                              )
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              {resolvedJob.description && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#16610E]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#151515]">
                      Description
                    </h3>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-[#777] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-[#777]">
                        Description
                      </p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Card */}
              {resolvedJob.notes && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#16610E]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#151515]">
                      Notes
                    </h3>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-[#777] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-[#777]">Notes</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Location Card (spans 2 cols) */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Job Location
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-[#777] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-[#777]">Address</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.address || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-[#777]">City</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.city || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">State</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.state || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">
                        Postal Code
                      </p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.postalCode || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">Country</p>
                      <p className="text-[#151515] font-medium">
                        {resolvedJob.country || '-'}
                      </p>
                    </div>
                  </div>
                  {resolvedJob.location?.coordinates && (
                    <>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-[#777]" />
                        <div>
                          <p className="text-sm text-[#777]">
                            Coordinates
                          </p>
                          <p className="text-[#151515] font-medium">
                            {resolvedJob.location.coordinates[1]},{' '}
                            {resolvedJob.location.coordinates[0]}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <StaticMap
                          lat={resolvedJob.location.coordinates[1]}
                          lng={resolvedJob.location.coordinates[0]}
                          height={300}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CompleteJobDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        onConfirm={async (receivePrice) => {
          if (!id) return;
          await completeJob({ jobId: id, receivePrice }).unwrap();
          toast.success('Job completed successfully');
          setCompleteDialogOpen(false);
        }}
      />

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#777]">
              Are you sure you want to cancel this job? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                Keep Job
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
