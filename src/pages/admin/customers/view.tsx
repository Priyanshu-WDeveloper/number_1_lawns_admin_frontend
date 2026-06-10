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
  Wallet,
  PowerOff,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { StaticMap } from '@/components/google-maps/static-map';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ROUTES } from '@/constants';

import {
  useGetCustomerByIdQuery,
  useToggleCustomerStatusMutation,
} from '@/API/api';

import type { ICustomer } from '@/types';

import Loader from '@/components/loader';

import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';
import { formatDate } from '@/lib/format-date';

import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';

export default function CustomerViewPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const location = useLocation();

  const passedCustomer = location.state?.customer as
    | ICustomer
    | undefined;

  const [toggleCustomerStatus] = useToggleCustomerStatusMutation();

  const { data, isLoading } = useGetCustomerByIdQuery(id || '', {
    skip: !id || !!passedCustomer,
  });

  if (!id) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Invalid customer ID</p>
        </div>
      </AppLayout>
    );
  }

  const customer = passedCustomer ?? (data as { customer?: ICustomer })?.customer ?? data;

  const handleStatusChange = async (
    status: 'active' | 'inactive',
  ) => {
    if (!customer) return;

    try {
      await toggleCustomerStatus({
        id: customer._id,
        status,
      }).unwrap();

      toast.success(`Customer set to ${status}`);
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

  if (!customer) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Customer not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <div className="mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.CUSTOMERS)}
              className="mb-4 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>

            {/* Header */}
            <div className="mb-6 rounded-2xl border border-[#ececec] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Left */}
                <div className="flex min-w-0 items-center gap-4">
                  <UserAvatar
                    image={customer.profileImage}
                    name={customer.fullName}
                    size="lg"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="truncate text-2xl font-bold text-foreground">
                        {customer.fullName}
                      </h1>

                      <StatusBadge
                        status={customer.status}
                        config={STATUS_CONFIG.customer}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Customer ID: {customer.customerId}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between gap-3 border-t pt-4 lg:border-t-0 lg:pt-0">
                  <div className="text-right">
                    <span
                      className={                      `text-lg font-semibold ${
                        (customer.balance ?? 0) < 0
                          ? 'text-red-500'
                          : 'text-primary'
                      }`}
                    >
                      {(customer.balance ?? 0) < 0 ? '-' : ''}$
                      {Math.abs(customer.balance || 0).toFixed(2)}
                    </span>

                    <p className="text-xs text-muted-foreground">
                      Balance
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-10 items-center justify-center rounded-xl text-green-700 transition hover:bg-green-50">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-52 rounded-2xl"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(
                            ROUTES.CUSTOMERS_EDIT.replace(
                              ':id',
                              customer._id,
                            ),
                            {
                              state: { customer },
                            },
                          )
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                        Edit Customer
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/customers/wallet/${customer._id}`,
                          )
                        }
                      >
                        <Wallet className="mr-2 h-4 w-4 text-primary" />
                        Wallet
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {customer.status === 'active' ? (
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() =>
                            handleStatusChange('inactive')
                          }
                        >
                          <PowerOff className="mr-2 h-4 w-4 text-red-500" />
                          Set Inactive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-primary focus:text-primary"
                          onClick={() => handleStatusChange('active')}
                        >
                          <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                          Set Active
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Information */}
              <div className="rounded-2xl border border-[#ececec] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">
                    Contact Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Email
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.email || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Phone
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.countryCode} {customer.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="rounded-2xl border border-[#ececec] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
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

                    <p className="mt-1 font-medium text-foreground">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>

                    <p className="mt-1 font-medium text-foreground">
                      {formatDate(customer.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="rounded-2xl border border-[#ececec] bg-white p-6 shadow-sm md:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">
                    Address Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />

                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Street Address
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.address || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        City
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.city || '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        State
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.state || '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Postal Code
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.postalCode || '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Country
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.country || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Latitude
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.location?.coordinates?.[1] ?? '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Longitude
                      </p>

                      <p className="font-medium text-foreground">
                        {customer.location?.coordinates?.[0] ?? '-'}
                      </p>
                    </div>
                  </div>

                  {customer.location?.coordinates && (
                    <div className="mt-4">
                      <StaticMap
                        lat={customer.location.coordinates[1]}
                        lng={customer.location.coordinates[0]}
                        height={300}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* End Grid */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
