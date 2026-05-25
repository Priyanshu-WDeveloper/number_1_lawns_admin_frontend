import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { ROUTES } from '@/constants';
import Loader from '@/components/loader';
import { useGetAdminDetailsQuery } from '@/API/api';
import ProfileContent from '@/components/profile/profile-content';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAdminDetailsQuery();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (isError || !data) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-[#6b7280]">Failed to load profile</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto">
          <ProfileContent admin={data.admin} onBack={() => navigate(ROUTES.DASHBOARD)} />
        </div>
      </div>
    </AppLayout>
  );
}
