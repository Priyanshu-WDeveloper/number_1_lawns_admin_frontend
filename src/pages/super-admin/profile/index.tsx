import { useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '@/components/layout/super-layout';
import { ROUTES } from '@/constants';
import Loader from '@/components/loader';
import { useGetAdminDetailsQuery } from '@/API/api';
import ProfileContent from '@/components/profile/profile-content';

export default function SuperAdminProfilePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAdminDetailsQuery();

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError || !data) {
    return (
      <SuperAdminLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-[#6b7280]">Failed to load profile</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto">
          <ProfileContent admin={data.admin} onBack={() => navigate(ROUTES.SUPER_ADMIN_DASHBOARD)} />
        </div>
      </div>
    </SuperAdminLayout>
  );
}
