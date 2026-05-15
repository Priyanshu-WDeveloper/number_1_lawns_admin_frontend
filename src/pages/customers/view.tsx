import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User,
  CreditCard,
  MoreVertical,
  Pencil,
  Trash2,
  Wallet,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  active: boolean;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  balance: number;
}

const mockCustomer: CustomerData = {
  name: 'Babu',
  email: 'babu_kondepudi@yahoo.co.nz',
  phone: '0211470500',
  address: '383A Richardson Road Mount Roskill',
  postalCode: '',
  city: '',
  state: '',
  country: '',
  active: true,
  status: 'Active',
  createdBy: 'Aman',
  createdAt: '2026-05-12T12:58:00Z',
  updatedAt: '2026-05-12T12:58:00Z',
  balance: 0,
};

export default function CustomerViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const customer = mockCustomer;

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openInGoogleMaps = () => {
    if (!customer.address) return;

    // Encode the address for Google Maps
    const fullAddress = [
      customer.address,
      customer.city,
      customer.state,
      customer.postalCode,
      customer.country,
    ]
      .filter(Boolean)
      .join(', ');

    const encodedAddress = encodeURIComponent(fullAddress);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      '_blank',
    );
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-10">
          <div className="mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/customers')}
              className="mb-4 text-[#777] hover:text-[#16610E] hover:bg-[#edf8e7]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>

            {/* Header Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 bg-[#16610E] text-white">
                    <AvatarFallback className="text-xl font-bold">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-[#151515]">
                      {customer.name}
                    </h1>
                    <p className="text-[#777] text-sm">
                      Customer ID: {id}
                    </p>
                  </div>
                </div>
                {/* <div className="text-right">
                  <Badge
                    className={`${customer.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'} border`}
                  >
                    {customer.status}
                  </Badge>
                  <div className="mt-2">
                    <span
                      className={`text-lg font-semibold ${customer.balance < 0 ? 'text-red-500' : 'text-green-600'}`}
                    >
                      {customer.balance < 0 ? '-' : ''}$
                      {Math.abs(customer.balance).toFixed(2)}
                    </span>
                    <p className="text-xs text-[#777]">Balance</p>
                  </div>
                </div> */}
                <div className="flex items-start gap-3">
                  <div className="text-right">
                    <Badge
                      className={`${
                        customer.active
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      } border`}
                    >
                      {customer.status}
                    </Badge>

                    <div className="mt-2">
                      <span
                        className={`text-lg font-semibold ${
                          customer.balance < 0
                            ? 'text-red-500'
                            : 'text-green-600'
                        }`}
                      >
                        {customer.balance < 0 ? '-' : ''}$
                        {Math.abs(customer.balance).toFixed(2)}
                      </span>

                      <p className="text-xs text-[#777]">Balance</p>
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
                          navigate(`/customers/edit/${id}`)
                        }
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                        Edit Customer
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/customers/wallet/${id}`)
                        }
                        className="cursor-pointer"
                      >
                        <Wallet className="mr-2 h-4 w-4 text-green-600" />
                        Wallet
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() =>
                          console.log('Delete customer:', id)
                        }
                        className="
          cursor-pointer
          text-red-500
          focus:text-red-500
        "
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Information Card */}
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
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Name</p>
                      <p className="text-[#151515] font-medium">
                        {customer.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Email</p>
                      <p className="text-[#151515] font-medium">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#777]" />
                    <div>
                      <p className="text-sm text-[#777]">Phone</p>
                      <p className="text-[#151515] font-medium">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Details Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
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
                        {customer.address || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#777]">City</p>
                      <p className="text-[#151515] font-medium">
                        {customer.city || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">State</p>
                      <p className="text-[#151515] font-medium">
                        {customer.state || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#777]">
                        Postal Code
                      </p>
                      <p className="text-[#151515] font-medium">
                        {customer.postalCode || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#777]">Country</p>
                      <p className="text-[#151515] font-medium">
                        {customer.country || '-'}
                      </p>
                    </div>
                  </div>

                  {/* View on Google Maps Button */}
                  {customer.address && (
                    <button
                      type="button"
                      onClick={openInGoogleMaps}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#edf8e7] hover:bg-[#dff0d4] border border-[#c7e8b9] rounded-xl text-[#16610E] font-medium transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      View on Google Maps
                    </button>
                  )}
                </div>
              </div>

              {/* Account Summary Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#edf8e7] flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-[#16610E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515]">
                    Account Summary
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-[#777]">Status</p>
                    <Badge
                      className={`mt-1 ${customer.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-[#777]">Created By</p>
                    <p className="text-[#151515] font-medium mt-1">
                      {customer.createdBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#777]">Created At</p>
                    <p className="text-[#151515] font-medium mt-1">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#777]">
                      Last Updated
                    </p>
                    <p className="text-[#151515] font-medium mt-1">
                      {formatDate(customer.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
