import { useState, useMemo } from 'react';
import {
  Ellipsis,
  Eye,
  Check,
  Ban,
  User,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';

import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable from '@/components/data-table/data-table';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useGetChildJobsQuery,
  useCancelJobMutation,
  useCompleteJobMutation,
  useAssignJobEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateJobDateMutation,
} from '@/API/api';
import { formatDate } from '@/lib/format-date';

import { getErrorMessage } from '@/lib/get-error-message';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CompleteJobDialog } from '@/components/admin/complete-job-dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import { useResponsiveLimit } from '@/hooks/use-responsive-limit';
import type { IJob, OrderItemInput } from '@/types';
import type { ListQueryParams } from '@/types/api.types';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function ScheduledJobsPage() {
  const navigate = useNavigate();

  const {
    setPage,
    setLimit,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
    queryParams,
  } = useDataTableQueryParams<ListQueryParams>({
    defaultLimit: useResponsiveLimit(),
    defaultStatus: 'pending',
    defaultSort: 'jobDate',
    mapStatusToApi: (status) =>
      status.toLowerCase().replace(' ', '-') as
        | 'pending'
        | 'completed'
        | 'cancelled'
        | 'upcoming'
        | 'overdue',
  });

  const queryParamsWithJobType = useMemo(
    () => ({ ...queryParams, jobType: 'recurring' as const }),
    [queryParams],
  );

  const { data: apiData, isLoading } = useGetChildJobsQuery(
    queryParamsWithJobType,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [cancelJob] = useCancelJobMutation();
  const [completeJob] = useCompleteJobMutation();
  const [assignJobEmployee] = useAssignJobEmployeeMutation();
  const [changeJobDate, { isLoading: UpdateJobDateLoading }] =
    useUpdateJobDateMutation();

  const { data: employeesData } = useGetEmployeesQuery({
    limit: 500,
    page: 1,
  });

  const [confirmAction, setConfirmAction] = useState<{
    type: 'complete' | 'cancel' | 'jobDateChange';
    jobId: string;
    paymentType?: string;
    jobDisplayId?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerImage?: string;
    title?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    jobType?: string;
    price?: number;
    notes?: string;
    description?: string;
    preferredTiming?: string;
    jobDate?: string;
    frequency?: { value: number; unit: string };
  } | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [assigningJobId, setAssigningJobId] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>();

  const childJobs = apiData?.jobs ?? [];
  const totalPages =
    apiData?.totalPages ??
    Math.ceil((apiData?.total ?? 0) / (apiData?.limit ?? 10));
  const pagination = apiData
    ? {
        page: apiData.page,
        limit: apiData.limit,
        total: apiData.total,
        totalPages,
      }
    : undefined;

  const employeeOptions = useMemo(
    () =>
      (employeesData?.employees ?? []).map((e) => ({
        _id: e._id,
        label: e.fullName,
        subtitle: e.email,
      })),
    [employeesData],
  );

  const handleCancel = async (id: string) => {
    try {
      await cancelJob({ jobId: id }).unwrap();
      toast.success('Job cancelled successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel job'));
    }
  };

  const handleComplete = async (
    id: string,
    receivePrice?: number,
    items?: OrderItemInput[],
    jobData?: {
      title?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      jobType?: string;
      price?: number;
      notes?: string;
      description?: string;
      preferredTiming?: string;
      paymentType?: string;
      jobDate?: string;
      frequency?: { value: number; unit: string };
      customerId?: string;
      // customerId?: { address?: string };
    },
  ) => {
    try {
      const payload: any = {
        jobId: id,
        receivePrice,
        items,
        completedDate: new Date().toISOString(),
      };

      if (jobData?.title) payload.title = jobData.title;
      if (jobData?.address) payload.address = jobData.address;
      if (jobData?.jobType) payload.jobType = jobData.jobType;
      if (jobData?.price !== undefined) payload.price = jobData.price;
      // if (jobData?.notes) payload.notes = jobData.notes;
      if (jobData?.description)
        payload.description = jobData.description;
      if (jobData?.preferredTiming)
        payload.preferredTiming = jobData.preferredTiming;
      if (jobData?.paymentType)
        payload.paymentType = jobData.paymentType;
      if (jobData?.jobDate) payload.jobDate = jobData.jobDate;
      if (jobData?.frequency) payload.frequency = jobData.frequency;
      // if (items?.title) payload.title = items.title;

      await completeJob(payload).unwrap();

      toast.success('Job completed successfully');
      setConfirmAction(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to complete job'));
    }
  };
  const handleChangeJobDate = async (id: string) => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    try {
      await changeJobDate({
        jobId: id,
        jobDate: selectedDate,
      }).unwrap();
      toast.success('Job Date Changed successfully');

      setConfirmAction(null);
      setSelectedDate(undefined);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to complete job'));
    }
  };

  const handleAssignEmployee = async () => {
    if (!assigningJobId || !selectedEmployee) return;
    try {
      await assignJobEmployee({
        id: assigningJobId,
        employee: selectedEmployee,
      }).unwrap();
      toast.success('Employee assigned successfully');
      setAssignDialogOpen(false);
      setSelectedEmployee('');
      setAssigningJobId('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to assign employee'));
    }
  };

  const getCustomerName = (customerId: unknown): string => {
    if (typeof customerId === 'object' && customerId) {
      const c = customerId as Record<string, unknown>;
      const first = (c.firstName as string) ?? '';
      const last = (c.lastName as string) ?? '';
      return `${first} ${last}`.trim() || '-';
    }
    return '-';
  };

  const getEmployeeName = (employeeId: unknown): string => {
    if (typeof employeeId === 'object' && employeeId) {
      const e = employeeId as Record<string, unknown>;
      const first = (e.firstName as string) ?? '';
      const last = (e.lastName as string) ?? '';
      return `${first} ${last}`.trim() || '-';
    }
    return '-';
  };

  // console.log(setStatusFilter);
  // console.log(statusFilter);
  // console.log('status', apiData || '');

  const columns: ColumnDef<IJob>[] = [
    {
      accessorKey: 'jobId',
      header: 'JobId',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">{row.jobId}</span>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: (row: IJob) => {
        const addr =
          row.address ||
          (typeof row.customerId === 'object'
            ? row.customerId?.address
            : undefined) ||
          '-';
        return (
          <span
            className="text-[#6b7280]"
            title={addr === '-' ? '' : addr}
          >
            {addr.length > 15 ? `${addr.slice(0, 15)}...` : addr}
          </span>
        );
      },
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {getCustomerName(row.customerId)}
        </span>
      ),
    },
    {
      accessorKey: 'employeeId',
      header: 'Employee',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {getEmployeeName(row.employeeId)}
        </span>
      ),
    },
    // {
    //   accessorKey: 'customerId',
    //   header: 'Customer',
    //   cell: (row: IJob) => (
    //     <AvatarCell
    //       name={getEmployeeName(row.customerId)}
    //       email={row.customerId.email}
    //       profileImage={row.customerId.profileImage}
    //     />
    //   ),
    // },
    // {
    //   accessorKey: 'employeeId',
    //   header: 'Employee',
    //   cell: (row: IJob) => (
    //     <AvatarCell
    //       name={getEmployeeName(row.employeeId)}
    //       email={row.employeeId.email}
    //       profileImage={row.employeeId.profileImage}
    //     />
    //   ),
    // },
    {
      accessorKey: 'jobDate',
      header: 'Date',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {formatDate(row.jobDate || '')}
        </span>
      ),
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment Type',
      cell: (row: IJob) => (
        <span className="text-[#6b7280] capitalize">
          {row.paymentType?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {row.price != null ? `$${row.price}` : '-'}
        </span>
      ),
    },

    // {
    //   accessorKey: 'status',
    //   header: 'Status',
    //   cell: (row: IJob) => (
    //     <StatusBadge
    //       status={getDisplayStatus(row)}
    //       config={STATUS_CONFIG.job}
    //     />
    //   ),
    // },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IJob) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.JOBS_VIEW.replace(':id', row._id ?? ''),
                { state: { from: ROUTES.SCHEDULED_JOBS } },
              )
            }
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-[#f5f5f5] text-[#374151] hover:bg-[#e5e5e5] transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          {/* {row._id && row.status === 'completed' && (
            <button
              type="button"
              onClick={() => handleViewReceipt(row._id)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-white text-primary border border-primary hover:bg-primary/5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Receipt
            </button>
          )} */}
          {row.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const c =
                    typeof row.customerId === 'object' &&
                    row.customerId
                      ? row.customerId
                      : null;
                  setConfirmAction({
                    type: 'complete',
                    jobId: row._id ?? '',
                    paymentType: row.paymentType,
                    jobDisplayId: `JOB-${row.jobId}`,
                    customerName: getCustomerName(row.customerId),
                    customerPhone: c?.phoneNumber,
                    customerEmail: c?.email,
                    customerImage: c?.profileImage,
                    title: row.title,
                    address: row.address || c?.address,
                    country: row.country,
                    jobType: row.jobType,
                    price: row.price,
                    notes: row.notes,
                    description: row.description,
                    preferredTiming: row.preferredTiming,
                    jobDate: row.jobDate,
                    frequency: row.frequency,
                  });
                }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Complete
              </button>
              {/* <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    type: 'cancel',
                    jobId: row._id ?? '',
                  })
                }
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Ban className="h-3.5 w-3.5" />
                Cancel
              </button> */}
            </>
          )}
          {row.status !== 'completed' &&
            row.status !== 'cancelled' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#6b7280] hover:bg-[#f5f5f5] transition-colors"
                  >
                    <Ellipsis className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(row.status === 'pending' ||
                    row.status === 'upcoming' ||
                    row.status === 'overdue') && (
                    <>
                      {row.status === 'pending' &&
                        (!row.employeeId ||
                          typeof row.employeeId === 'string') && (
                          <DropdownMenuItem
                            onClick={() => {
                              setAssigningJobId(row._id ?? '');
                              setAssignDialogOpen(true);
                            }}
                          >
                            <User className="mr-2 h-4 w-4 text-blue-500" />
                            <span>Assign Employee</span>
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDate(
                            row.jobDate
                              ? format(
                                  new Date(row.jobDate),
                                  'yyyy-MM-dd',
                                )
                              : undefined,
                          );
                          setConfirmAction({
                            type: 'jobDateChange',
                            jobId: row._id || '',
                          });
                        }}
                      >
                        <CalendarDays className="mr-2 h-4 w-4 text-green-600" />
                        <span>Change Date</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmAction({
                            type: 'cancel',
                            jobId: row._id ?? '',
                          })
                        }
                      >
                        <Ban className="mr-2 h-4 w-4 text-red-500" />
                        <span>Cancel Job</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:pt-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              title="Scheduled Jobs"
              subtitle="View and manage scheduled child jobs from recurring parents."
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<IJob>
                data={childJobs}
                loading={isLoading}
                columns={columns}
                title=""
                description=""
                searchPlaceholder="Search scheduled jobs..."
                searchValue={search}
                onSearchChange={setSearch}
                filterField="status"
                filterOptions={[
                  'Overdue',
                  'Pending',
                  'Completed',
                  'Cancelled',
                  'Upcoming',
                ]}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                showAllOption={false}
                serverSideFiltering
                sortValue={sort}
                onSortChange={setSort}
                serverSideSorting
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <CompleteJobDialog
        open={confirmAction?.type === 'complete'}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        onConfirm={async ({ receivePrice, items }) => {
          if (confirmAction) {
            const jobData: any = {
              address: confirmAction.address,
              city: confirmAction.city,
              state: confirmAction.state,
              country: confirmAction.country,
              postalCode: confirmAction.postalCode,
              jobType: confirmAction.jobType,
              price: confirmAction.price,
              notes: confirmAction.notes,
              description: confirmAction.description,
              preferredTiming: confirmAction.preferredTiming,
              paymentType: confirmAction.paymentType,
              jobDate: confirmAction.jobDate,
              frequency: confirmAction.frequency,
            };

            if (confirmAction.title)
              jobData.title = confirmAction.title;

            await handleComplete(
              confirmAction.jobId,
              receivePrice,
              items,
              jobData,
            );
          }
        }}
        paymentType={confirmAction?.paymentType}
        jobDisplayId={confirmAction?.jobDisplayId}
        customerName={confirmAction?.customerName}
        customerPhone={confirmAction?.customerPhone}
        customerEmail={confirmAction?.customerEmail}
        customerImage={confirmAction?.customerImage}
      /> */}

      <CompleteJobDialog
        open={confirmAction?.type === 'complete'}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        // onConfirm={async ({ receivePrice, items }) => {
        //   ...
        // }}
        onConfirm={async ({ receivePrice, items }) => {
          if (confirmAction) {
            const jobData: any = {
              address: confirmAction.address,
              city: confirmAction.city,
              state: confirmAction.state,
              country: confirmAction.country,
              postalCode: confirmAction.postalCode,
              jobType: confirmAction.jobType,
              price: confirmAction.price,
              notes: confirmAction.notes,
              description: confirmAction.description,
              preferredTiming: confirmAction.preferredTiming,
              paymentType: confirmAction.paymentType,
              jobDate: confirmAction.jobDate,
              frequency: confirmAction.frequency,
            };

            if (confirmAction.title)
              jobData.title = confirmAction.title;

            await handleComplete(
              confirmAction.jobId,
              receivePrice,
              items,
              jobData,
            );
          }
        }}
        paymentType={confirmAction?.paymentType}
        jobDisplayId={confirmAction?.jobDisplayId}
        customerName={confirmAction?.customerName}
        customerPhone={confirmAction?.customerPhone}
        customerEmail={confirmAction?.customerEmail}
        customerImage={confirmAction?.customerImage}
        initialAddress={confirmAction?.address}
        jobTitle={confirmAction?.title}
        jobPrice={confirmAction?.price}
      />
      <Dialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAssignDialogOpen(false);
            setSelectedEmployee('');
            setAssigningJobId('');
          }
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
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
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
              disabled={!selectedEmployee}
              onClick={handleAssignEmployee}
            >
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmAction?.type === 'cancel'}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Cancel Job"
        description="Are you sure you want to cancel this scheduled job?"
        confirmText="Cancel Job"
        onConfirm={async () => {
          if (confirmAction) await handleCancel(confirmAction.jobId);
          setConfirmAction(null);
        }}
      />
      <Dialog
        open={confirmAction?.type === 'jobDateChange'}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setSelectedDate(undefined);
          }
        }}
      >
        {/* <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Job Date</DialogTitle>
          </DialogHeader>

          <DatePicker
            date={selectedDate}
            onChange={setSelectedDate}
          />

          <Button
            onClick={() => {
              if (!confirmAction?.jobId) return;
              handleChangeJobDate(confirmAction.jobId);
            }}
            disabled={!selectedDate}
          >
            Save
          </Button>
        </DialogContent> */}
        {/* <DialogContent> */}
        <DialogContent className="max-w-[320px]">
          <DialogHeader>
            <DialogTitle>Change Job Date</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={
                selectedDate ? new Date(selectedDate) : undefined
              }
              onSelect={(date) => {
                if (!date) return;

                setSelectedDate(format(date, 'yyyy-MM-dd'));
              }}
              // setConfirmAction(null);
              className="rounded-md border"
            />
          </div>

          <Button
            onClick={() =>
              handleChangeJobDate(confirmAction?.jobId || '')
            }
            disabled={!selectedDate}
          >
            {UpdateJobDateLoading
              ? 'Changing Date...'
              : ' Change Date'}
          </Button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
