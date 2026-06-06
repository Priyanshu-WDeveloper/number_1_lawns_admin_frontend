import { useState } from 'react';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  MoreVertical,
  Pencil,
  PowerOff,
  Power,
  ExternalLink,
  FileText,
  Download,
  // User,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ROUTES } from '@/constants';

import type { IEmployee } from '@/types';
import Loader from '@/components/loader';
import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';
import { formatDate } from '@/lib/format-date';
import {
  useGetEmployeeByIdQuery,
  useToggleEmployeeStatusMutation,
} from '@/API/api';

export default function EmployeeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmployee = location.state?.employee as
    | IEmployee
    | undefined;
  const [toggleEmployeeStatus] = useToggleEmployeeStatusMutation();

  const { data, isLoading, isError } = useGetEmployeeByIdQuery(id!, {
    skip: !id || !!passedEmployee,
  });

  const employee = passedEmployee ?? data;

  const [selectedDoc, setSelectedDoc] = useState<{
    key: string;
    value: string;
  } | null>(null);

  const isImageUrl = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
  const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url);

  // const handleDelete = async () => {
  //   if (!employee) return;
  //   try {
  //     await deleteEmployee(employee._id).unwrap();
  //     toast.success('Employee deleted successfully');
  //     navigate(ROUTES.EMPLOYEES);
  //   } catch {
  //     toast.error('Failed to delete employee');
  //   }
  // };
  const handleStatusChange = async (
    id: string,
    status: 'active' | 'inactive',
  ) => {
    try {
      await toggleEmployeeStatus({ id, status }).unwrap();
      toast.success(`Employee set to ${status}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (isError || !employee) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Employee not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <div className="mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.EMPLOYEES)}
              className="mb-4 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    image={employee.profileImage}
                    name={employee.fullName}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-foreground">
                        {employee.fullName}
                      </h1>

                      <StatusBadge
                        status={employee.status}
                        config={STATUS_CONFIG.employee}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Employee ID: {employee.employeeId}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-10 items-center justify-center rounded-xl text-green-700 hover:bg-green-50">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-52 rounded-2xl"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(
                            ROUTES.EMPLOYEES_EDIT.replace(
                              ':id',
                              employee._id,
                            ),
                            { state: { employee } },
                          )
                        }
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                        Edit Employee
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      {/* 
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Employee
                      </DropdownMenuItem> */}
                      {employee.status === 'active' ? (
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() =>
                            handleStatusChange(
                              employee._id,
                              'inactive',
                            )
                          }
                        >
                          <PowerOff className="mr-2 h-4 w-4 text-red-500 focus:text-red-500" />
                          Set Inactive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-primary focus:text-primary"
                          onClick={() =>
                            handleStatusChange(employee._id, 'active')
                          }
                        >
                          <Power className="mr-2 h-4 w-4 text-primary focus:text-primary" />
                          Set Active
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Contact Information
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-foreground font-medium">
                        {employee.fullName}
                      </p>
                    </div>
                  </div> */}
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Email
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Phone
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.countryCode}{' '}
                          {employee.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] hidden md:block">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Account Summary
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Managed By</p>
                    <p className="text-foreground font-medium mt-1">
                      {employee.parentAdmin || '-'}
                    </p>
                  </div> */}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created At
                      </p>
                      <p className="text-foreground font-medium mt-1">
                        {formatDate(employee.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="text-foreground font-medium mt-1">
                        {formatDate(employee.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Address Details
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Street Address
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.address || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          City
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.city || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          State
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.state || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Postal Code
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.postalCode || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Country
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.country || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Latitude
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.location?.coordinates?.[1] ?? '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Longitude
                        </p>
                        <p className="text-foreground font-medium">
                          {employee.location?.coordinates?.[0] ?? '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {employee.attachments &&
                employee.attachments.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Documents
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {employee.attachments.map((doc, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-background hover:bg-primary/10 transition-colors group text-left"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {doc.key}
                          </span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Mobile Account Summary */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Account Summary
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Created At
                    </p>
                    <p className="text-foreground font-medium mt-1">
                      {formatDate(employee.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="text-foreground font-medium mt-1">
                      {formatDate(employee.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Dialog
              open={!!selectedDoc}
              onOpenChange={(open) => {
                if (!open) setSelectedDoc(null);
              }}
            >
              <DialogContent className="w-[calc(100%-24px)] sm:max-w-lg rounded-3xl border-0 p-0 overflow-hidden shadow-2xl bg-white">
                <DialogHeader className="px-6 pt-8 sm:px-8">
                  <DialogTitle className="truncate text-lg sm:text-xl font-semibold tracking-tight text-zinc-900">
                    {selectedDoc?.key}
                  </DialogTitle>
                </DialogHeader>
                {selectedDoc && (
                  <div className="px-6 pb-6 sm:px-8">
                    {isImageUrl(selectedDoc.value) ? (
                      <div className="flex items-center justify-center">
                        <img
                          src={selectedDoc.value}
                          alt={selectedDoc.key}
                          className="max-h-[65vh] w-full object-contain rounded-lg"
                        />
                      </div>
                    ) : isPdfUrl(selectedDoc.value) ? (
                      <iframe
                        src={selectedDoc.value}
                        className="w-full h-[65vh] rounded-lg border border-border"
                        title={selectedDoc.key}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-foreground mb-2">
                          Preview not available
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                          This file type cannot be previewed
                        </p>
                        <a
                          href={selectedDoc.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                        >
                          <Download className="h-4 w-4" />
                          Download to view
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
