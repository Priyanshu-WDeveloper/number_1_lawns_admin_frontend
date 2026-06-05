import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, Globe, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';
import { InputWithIcon } from '@/components/forms/input-with-icon';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useLoginMutation } from '@/API/api';
import { ROUTES } from '@/constants';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine((pwd: string) => !pwd.includes(' '), {
      message: 'Password cannot contain spaces',
    }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data).unwrap();

      if (res.user) {
        toast.success('Welcome back Admin!');
        if (!rememberMe) {
          const authData = localStorage.getItem('auth_state');
          if (authData) {
            sessionStorage.setItem('auth_state', authData);
            localStorage.removeItem('auth_state');
          }
        }
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(
          error,
          'Login failed. Please check your credentials.',
        ),
      );
    }
  };

  return (
    <div className="h-dvh sm:bg-[#eef5df] lg:bg-[#eef5df] flex flex-col px-0 sm:px-6 pt-0 sm:pt-6 relative overflow-hidden">
      {/* Mobile Background Effects */}
      <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/5" />

        <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-primary/5" />

        <div className="absolute bottom-0 left-0 h-40 w-full bg-[url('/grass.png')] bg-repeat-x bg-bottom opacity-20" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex items-start lg:items-start justify-center flex-1 overflow-y-auto">
        <div className="w-full h-full bg-transparent lg:bg-[#f8f8f4] lg:rounded-[28px] lg:shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 h-full">
            {/* Left Section */}
            <div className="relative overflow-hidden hidden lg:block">
              <img
                src="/bg.jpg"
                alt="Nature"
                className="absolute inset-0 h-full w-full object-fill"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-[#ffffffd9] via-[#ffffff80] to-[#00000030]" />

              <div className="relative z-10 flex flex-col h-full p-10 lg:p-14">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary shrink-0 flex items-center justify-center p-[2px]">
                    <img
                      src="/image.png"
                      alt="Logo"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  <h1 className="text-3xl font-bold text-primary">
                    No. 1 Lawns
                  </h1>
                </div>

                <div className="mt-20">
                  <h2 className="text-5xl font-bold text-primary leading-tight">
                    Welcome Back!
                  </h2>

                  <p className="mt-5 text-xl text-gray-700 max-w-md leading-9">
                    Login to continue your journey with No. 1 Lawns
                  </p>

                  {/* Divider */}
                  <div className="flex items-center gap-4 mt-8">
                    <div className="h-[1px] w-20 bg-primary/30" />

                    <Leaf className="w-5 h-5 text-primary" />

                    <div className="h-[1px] w-20 bg-primary/30" />
                  </div>

                  {/* Quote Card */}
                  <div className="mt-10 bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-5 max-w-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary overflow-hidden shrink-0 flex items-center justify-center">
                        <Leaf className="text-white w-6 h-6" />
                      </div>

                      <p className="text-gray-700 leading-7">
                        Let&apos;s grow a No. 1 Lawns tomorrow,
                        together.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1" />
              </div>
            </div>

            {/* Right Section */}
            <div className="relative z-10 mt-0 sm:mt-13 lg:bg-[#f8f8f4] w-full flex flex-col px-0 py-0 lg:px-12">
                <div className="w-full my-auto bg-white rounded-t-[36px] lg:rounded-[28px] shadow-none lg:shadow-xl border-t border-gray-100 px-6 py-8 sm:p-8 flex flex-col max-sm:h-dvh max-sm:overflow-y-auto sm:min-h-[520px] lg:min-h-[520px] lg:overflow-y-auto">
                  {/* Mobile branding */}
                  <div className="lg:hidden flex flex-col items-center justify-center pt-10 mb-10">
                    <div className="w-28 h-28 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center p-3">
                      <img
                        src="/image.png"
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <h1 className="mt-6 text-4xl font-bold tracking-wide text-black">
                      NO. 1 LAWNS
                    </h1>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-[2px] w-12 bg-primary/40" />

                      <span className="text-sm font-semibold tracking-wide text-primary">
                        GARDEN MAINTENANCE
                      </span>

                      <div className="h-[2px] w-12 bg-primary/40" />
                    </div>
                  </div>

                  {/* Desktop heading */}
                  <div className="hidden lg:block text-center">
                    <h2 className="text-[2rem] sm:text-[2.5rem] font-bold text-primary leading-tight">
                      Log in to your Account
                    </h2>

                    <p className="mt-4 text-base sm:text-xl leading-7 sm:leading-9 text-gray-500">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  {/* Mobile welcome section */}
                  <div className="lg:hidden mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-14 rounded-full bg-primary mt-1" />

                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          Welcome back Admin!
                        </h2>

                        <p className="mt-2 text-lg text-gray-500">
                          Sign in to manage your lawn
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Email */}
                    <div>
                      <label className="text-sm lg:text-base uppercase lg:normal-case tracking-wide lg:tracking-normal text-primary lg:text-gray-700 font-semibold lg:font-medium">
                        Email address
                      </label>

                      <div className="mt-3">
                        <InputWithIcon
                          placeholder="admin@mail.com"
                          icon={<Mail />}
                          className="h-16 rounded-2xl bg-[#f6fff4] border-primary/20"
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-sm lg:text-base uppercase lg:normal-case tracking-wide lg:tracking-normal text-primary lg:text-gray-700 font-semibold lg:font-medium">
                        Password
                      </label>

                      <div className="mt-3">
                        <InputWithIcon
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          icon={<Lock />}
                          trailingIcon={
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword(!showPassword)
                              }
                              className="focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="size-6 text-primary" />
                              ) : (
                                <Eye className="size-6 text-primary" />
                              )}
                            </button>
                          }
                          autoComplete="off"
                          className="h-16 rounded-2xl bg-[#f6fff4] border-primary/20"
                          {...register('password')}
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Remember */}
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <label className="flex items-center gap-2 text-gray-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) =>
                            setRememberMe(e.target.checked)
                          }
                          className="accent-primary w-4 h-4"
                        />
                        Remember me
                      </label>

                      <button
                        type="button"
                        className="text-primary font-semibold"
                        onClick={() =>
                          navigate(ROUTES.FORGOT_PASSWORD)
                        }
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-16 text-xl rounded-2xl bg-gradient-to-r from-[#11b53c] to-[#008a14] hover:opacity-95"
                    >
                      {isLoading ? 'Signing In...' : 'SIGN IN →'}
                    </Button>
                  </form>

                  <div className="mt-auto border-t border-gray-100 pt-4 pb-2 lg:hidden">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <p className="text-[12px] leading-5 text-gray-500">
                        © 2026 No. 1 Lawns. All rights reserved.
                      </p>

                      <div className="flex items-center justify-center gap-3 text-[13px] font-medium">
                        <button className="text-gray-600 transition hover:text-primary">
                          Privacy Policy
                        </button>

                        <div className="h-3 w-px bg-gray-300" />

                        <button className="text-gray-600 transition hover:text-primary">
                          Terms of Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Bottom Info */}
                <div className="border-gray-200 pt-6 hidden sm:block">
                  <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-3">
                    {/* Card 1 */}
                    <div className="flex w-full items-center gap-3 rounded-2xl bg-[#f7faf2] p-4 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Leaf className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">
                          Eco Friendly
                        </h4>

                        <p className="text-xs text-gray-500">
                          Sustainable solutions
                        </p>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="flex w-full items-center gap-3 rounded-2xl bg-[#f7faf2] p-4 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Leaf className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">
                          Grow Together
                        </h4>

                        <p className="text-xs text-gray-500">
                          Community & support
                        </p>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="flex w-full items-center gap-3 rounded-2xl bg-[#f7faf2] p-4 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">
                          Better Future
                        </h4>

                        <p className="text-xs text-gray-500">
                          For a greener planet
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden sm:block w-full px-4 sm:px-10 pt-[18px]">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[15px] text-[#6d6d6d]">
          <span>© 2026 No. 1 Lawns. All rights reserved.</span>

          <span className="hidden sm:inline text-[#bdbdbd]">|</span>

          <button className="hover:text-primary transition">
            Privacy Policy
          </button>

          <span className="hidden sm:inline text-[#bdbdbd]">|</span>

          <button className="hover:text-primary transition">
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
