import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '@/store/auth-slice';
import { ROUTES } from '@/constants';
import Loader from '@/components/loader';

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
          `${import.meta.env.VITE_API_URL}/admins/impersonate`,
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
              },
              token: data.accessToken,
            }),
          );
          navigate(ROUTES.DASHBOARD, { replace: true });
          return;
        }
      } catch {
        /* fall through */
      }

      navigate(ROUTES.LOGIN, { replace: true });
    };

    exchange();
  }, [dispatch, navigate, searchParams]);

  return <Loader />;
};

export default ImpersonateHandler;
