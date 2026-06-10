import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountDropdown from '@/components/account-dropdown';
import { ROUTES } from '@/constants';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useSidebar } from '@/components/ui/sidebar';
import { useGetAdminDetailsQuery } from '@/API/api';

interface NavbarProps {
  title: string;
  subtitle?: string;
  showWelcome?: boolean;
}

const roleLabels: Record<number, string> = {
  1: 'Super Admin',
  2: 'Admin',
};

export function Navbar({
  title,
  subtitle = "Here's what's happening with your system today.",
  showWelcome = true,
}: NavbarProps) {
  useGetAdminDetailsQuery();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const { toggleSidebar } = useSidebar();

  const welcomeText = user
    ? `Welcome back, ${roleLabels[user.role] || 'Admin'}`
    : 'Welcome back, Admin';

  return (
    <div className="px-4 py-4 sm:py-0 sm:pb-1 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden h-9 w-9 rounded-lg bg-[#166534] text-white border-0 shadow-xs shrink-0 flex items-center justify-center"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 sm:block">
            <h2 className="text-[17px] sm:text-[22px] font-bold sm:font-semibold text-[#151515] truncate">
              {title}
            </h2>

            {showWelcome && (
              <p className="hidden sm:block mt-1 text-[13px] text-[#6b7280]">
                {welcomeText}
              </p>
            )}

            {!showWelcome && subtitle && (
              <p className="hidden sm:block mt-1 text-[13px] text-[#6b7280]">
                {subtitle}
              </p>
            )}
            {/* <span className="sm:hidden text-[13px] text-[#6b7280] truncate">
              {showWelcome ? welcomeText : subtitle}
            </span> */}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="relative mr-2 flex h-9 w-9 items-center justify-center"
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
        >
          <Bell className="h-[18px] w-[18px]  text-[#6b7280]" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-[#166534]" />
        </button>

        <AccountDropdown variant="navbar" />
      </div>
    </div>
  );
}
