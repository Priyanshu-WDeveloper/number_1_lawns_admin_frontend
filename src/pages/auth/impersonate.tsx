import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '@/store/auth-slice';
import { ROUTES } from '@/constants';
import { getBaseUrl } from '@/lib/config';
import Loader from '@/components/loader';
import toast from 'react-hot-toast';

const ImpersonateHandler = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    const exchange = async () => {
      try {
        const res = await fetch(
          `${getBaseUrl()}/admins/impersonate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          },
        );

        if (res.ok) {
          const data = await res.json();
          dispatch(
            setAuth({
              user: {
                fullName: data.user.fullName,
                email: data.user.email,
                role: data.user.role,
                validity: data.user.validity,
                profileImage: data.user.profileImage,
              },
              token: data.token,
            }),
          );
          navigate(ROUTES.DASHBOARD, { replace: true });
          return;
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Impersonation failed');
      }

      navigate(ROUTES.LOGIN, { replace: true });
    };

    exchange();
  }, [dispatch, navigate, searchParams]);

  return <Loader />;
};

export default ImpersonateHandler;
