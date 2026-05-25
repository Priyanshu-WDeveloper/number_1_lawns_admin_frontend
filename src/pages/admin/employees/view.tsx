import { useState } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

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
          <p className="text-[#777]">Employee not found</p>
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
              onClick={() => navigate(ROUTES.EMPLOYEES)}
              className="mb-4 text-[#777] hover:text-[#16610E] hover:bg-[#edf8e7]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16  text-white">
                    {employee.profileImage ? (
                      <img
                        src={employee.profileImage}
                        alt={employee.fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-xl font-bold">
                        {getInitials(employee.fullName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-[#151515]">
                        {employee.fullName}
                      </h1>

                      <StatusBadge
                        status={employee.status}
                        config={STATUS_CONFIG.employee}
                      />
                    </div>

                    <p className="text-sm text-[#777]">
                      Employee ID: {employee.employeeId}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
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
                          className="text-green-600 focus:text-green-600"
                          onClick={() =>
                            handleStatusChange(employee._id, 'active')
                          }
                        >
                          <Power className="mr-2 h-4 w-4 text-green-600 focus:text-green-600" />
                          Set Active
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Contact Information
                  </h3>
                </div>
                <div className="space-y-4">
                  {/* <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Name</p>
                      <p className="text-[#151515] font-medium">
                        {employee.fullName}
                      </p>
                    </div>
                  </div> */}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Email</p>
                      <p className="text-[#151515] font-medium">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Phone</p>
                      <p className="text-[#151515] font-medium">
                        {employee.countryCode} {employee.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Account Summary
                  </h3>
                </div>
                <div className="space-y-4">
                  {/* <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#777]">Managed By</p>
                    <p className="text-[#151515] font-medium mt-1">
                      {employee.parentAdmin || '-'}
                    </p>
                  </div> */}
                  <div>
                    <p className="text-sm text-[#777]">Created At</p>
                    <p className="text-[#151515] font-medium mt-1">
                      {formatDate(employee.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#777]">
                      Last Updated
                    </p>
                    <p className="text-[#151515] font-medium mt-1">
                      {formatDate(employee.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Address Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-[#777] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-[#777]">
                        Street Address
                      </p>
                      <p className="text-[#151515] font-medium">
                        {employee.address || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-[#777]">City</p>
                      <p className="text-[#151515] font-medium">
                        {employee.city || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">State</p>
                      <p className="text-[#151515] font-medium">
                        {employee.state || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">
                        Postal Code
                      </p>
                      <p className="text-[#151515] font-medium">
                        {employee.postalCode || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">Country</p>
                      <p className="text-[#151515] font-medium">
                        {employee.country || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">Latitude</p>
                      <p className="text-[#151515] font-medium">
                        {employee.location?.coordinates?.[1] ?? '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">Longitude</p>
                      <p className="text-[#151515] font-medium">
                        {employee.location?.coordinates?.[0] ?? '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {employee.attachments && employee.attachments.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#16610E]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#151515]">
                      Documents
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {employee.attachments.map((doc, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-[#fafafa] hover:bg-[#edf8e7] transition-colors group text-left"
                      >
                        <span className="text-sm font-medium text-[#151515]">
                          {doc.key}
                        </span>
                        <ExternalLink className="h-4 w-4 text-[#777] group-hover:text-[#16610E] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Dialog
                open={!!selectedDoc}
                onOpenChange={(open) => {
                  if (!open) setSelectedDoc(null);
                }}
              >
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="truncate">
                      {selectedDoc?.key}
                    </DialogTitle>
                  </DialogHeader>
                  {selectedDoc && (
                    <div className="py-2">
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
                          className="w-full h-[65vh] rounded-lg border border-[#e5e5e5]"
                          title={selectedDoc.key}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                          <FileText className="h-16 w-16 text-[#777] mb-4" />
                          <p className="text-lg font-medium text-[#151515] mb-2">
                            Preview not available
                          </p>
                          <p className="text-sm text-[#777] mb-6">
                            This file type cannot be previewed
                          </p>
                          <a
                            href={selectedDoc.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16610E] text-white hover:bg-[#0f4a09]"
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
