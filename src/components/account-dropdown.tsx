import {
  ChevronDown,
  CircleDot,
  CreditCard,
  LogOut,
  Mail,
  User,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuthStore } from '@/store/authStore';

export default function AccountDropdown({
  superAccess,
}: {
  superAccess: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2 transition hover:bg-muted">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {user?.name ? getInitials(user.name) : 'A'}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm font-semibold">
          {user?.name || `${superAccess ? 'Super Admin' : 'Admin'}`}
        </span>

        <ChevronDown className="ml-3 h-5 w-5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="w-80 rounded-2xl border bg-white p-0 shadow-xl"
      >
        {/* Top Section */}
        <div className="space-y-3 p-4">
          <div>
            <h2 className="text-lg font-medium text-slate-800">
              {user?.name || 'Admin'}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {user?.email || 'admin@example.com'}
            </p>
          </div>

          {/* Subscription Badge */}
          <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <CircleDot className="h-4 w-4 fill-green-500 text-green-500" />

              <span className="text-sm font-medium text-green-600">
                Valid till 01 Jul 2026
              </span>
            </div>

            <span className="text-sm font-medium text-green-500">
              48d left
            </span>
          </div>
        </div>

        <Separator />

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
            <User className="h-4 w-4 text-slate-700" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
            <CreditCard className="h-4 w-4 text-slate-700" />
            Change Password
          </DropdownMenuItem>
        </div>

        <Separator />

        <DropdownMenuItem className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
          <Mail className="h-4 w-4 text-slate-700" />
          Support
        </DropdownMenuItem>

        <Separator />

        <DropdownMenuItem
          onClick={() => navigate('/login')}
          className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-red-500 focus:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
