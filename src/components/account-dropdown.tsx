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
import { UserAvatar } from '@/components/ui/user-avatar';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import toast from 'react-hot-toast';
import { ConfirmDialog } from './ui/confirm-dialog';
import { useState } from 'react';
import { ROUTES } from '@/constants';
import {
  useGetAdminDetailsQuery,
  useLogoutMutation,
} from '@/API/api';
import { format } from 'date-fns';
import { ChangeAdminPasswordDialog } from '@/pages/admin/change-password';

export default function AccountDropdown({
  superAccess = false,
  variant = 'default',
}: {
  superAccess?: boolean;
  variant?: 'default' | 'navbar';
}) {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { data } = useGetAdminDetailsQuery();
  const [logout] = useLogoutMutation();
  const daysLeft = user?.validity
    ? Math.ceil(
        (new Date(user.validity).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success('Logged out');
      setShowLogoutDialog(false);
      navigate(
        superAccess ? ROUTES.SUPER_ADMIN_LOGIN : ROUTES.LOGIN,
        { replace: true },
      );
    } catch (error) {
      console.error(error);
    }
  };

  // const getAdminDetails = async () => {
  //   // const res = await getAdminDetailsData();
  //   console.log(
  //     '\n===================== 🟢 res =====================',
  //   );
  //   console.log(res);
  //   console.log(
  //     '=================================================\n',
  //   );
  // };

  // useEffect(() => {
  //   getAdminDetails();
  // }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          variant === 'navbar'
            ? 'flex items-center rounded-full sm:rounded-xl sm:border sm:bg-white sm:px-5 sm:py-3 sm:gap-3 transition sm:hover:bg-muted hover:opacity-80'
            : 'flex items-center gap-3 rounded-xl border bg-white px-5 py-3 transition hover:bg-muted'
        }
      >
        {variant === 'navbar' ? (
          <>
            <div className="flex sm:hidden items-center gap-2">
              <UserAvatar
                name={data?.admin.fullName || user?.fullName || '-'}
                image={
                  data?.admin.profileImage || user?.profileImage || ''
                }
                size="sm"
              />
              {/* <span className="text-sm font-medium text-[#6b7280]">
                {user?.role === 1
                  ? 'Super Admin'
                  : user?.role === 2
                    ? 'Admin'
                    : superAccess
                      ? 'Super Admin'
                      : 'Admin'}
              </span> */}
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <UserAvatar
                name={data?.admin.fullName || user?.fullName || ''}
                image={data?.admin.profileImage || user?.profileImage}
                size="sm"
              />
              <span className="text-sm font-semibold">
                {user?.fullName ||
                  `${superAccess ? 'Super Admin' : 'Admin'}`}
              </span>
              <ChevronDown className="ml-3 h-5 w-5 text-muted-foreground" />
            </div>
          </>
        ) : (
          <>
            <UserAvatar
              name={user?.fullName ?? ''}
              image={user?.profileImage}
              size="sm"
            />

            <span className="text-sm font-semibold">
              {user?.fullName ||
                `${superAccess ? 'Super Admin' : 'Admin'}`}
            </span>

            <ChevronDown className="ml-3 h-5 w-5 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="w-80 rounded-2xl border bg-white p-0 shadow-xl"
      >
        {/* Top Section */}
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={data?.admin.fullName || user?.fullName || ''}
              image={data?.admin.profileImage || user?.profileImage}
              size="sm"
            />
            <div>
              <h2 className="text-lg font-medium text-slate-800">
                {user?.fullName || 'Admin'}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>

          {!superAccess && daysLeft !== null && daysLeft <= 7 && (
            <div
              className={`flex items-start justify-between rounded-xl px-4 py-3 ${
                daysLeft <= 3 ? 'bg-red-50' : 'bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <CircleDot
                  className={`mt-0.5 h-4 w-4 fill-current ${
                    daysLeft <= 3 ? 'text-red-500' : 'text-amber-500'
                  }`}
                />

                <div>
                  <span
                    className={`text-sm font-medium ${
                      daysLeft <= 3
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {daysLeft <= 0
                      ? 'Expired'
                      : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                  </span>
                  <p
                    className={`text-xs ${
                      daysLeft <= 3
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    Expires{' '}
                    {format(new Date(user!.validity), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={() => navigate(ROUTES.PROFILE)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm"
          >
            <User className="h-4 w-4 text-slate-700" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowChangePassword(true)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm"
          >
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
        <ChangeAdminPasswordDialog
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
