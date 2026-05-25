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

import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import toast from 'react-hot-toast';
import { ConfirmDialog } from './ui/confirm-dialog';
import { useState } from 'react';
import { ROUTES } from '@/constants';
import { localLogout } from '@/lib/auth';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/store/auth-slice';
import { api } from '@/API/api';

export default function AccountDropdown({
  superAccess = false,
}: {
  superAccess?: boolean;
}) {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      localLogout();
      dispatch(clearAuth());
      dispatch(api.util.resetApiState());
      toast.success('Logged out');
      setShowLogoutDialog(false);

      navigate(
        superAccess ? ROUTES.SUPER_ADMIN_LOGIN : ROUTES.LOGIN,
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

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
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl border bg-white px-5 py-3 transition hover:bg-muted">
        {/* <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2 transition hover:bg-muted"> */}
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {user?.fullName ? getInitials(user.fullName) : 'A'}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm font-semibold">
          {user?.fullName ||
            `${superAccess ? 'Super Admin' : 'Admin'}`}
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
              {user?.fullName || 'Admin'}
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

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={() => navigate(superAccess ? ROUTES.SUPER_ADMIN_PROFILE : ROUTES.PROFILE)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm"
          >
            <User className="h-4 w-4 text-slate-700" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
            <CreditCard className="h-4 w-4 text-slate-700" />
            Change Password
          </DropdownMenuItem>
        </div>

        <DropdownMenuItem className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
          <Mail className="h-4 w-4 text-slate-700" />
          Support
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setShowLogoutDialog(true)}
          className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-red-500 focus:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
        <ConfirmDialog
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          title="Logout"
          description="Are you sure you want to logout? You will need to login again to access your account."
          confirmText="Logout"
          onConfirm={handleLogout}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
