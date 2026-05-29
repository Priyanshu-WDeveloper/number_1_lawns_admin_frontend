import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Leaf,
  Mail,
  ArrowLeft,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';
import { InputWithIcon } from '@/components/forms/input-with-icon';
import OtpInput from '@/components/forms/otp-input';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from '@/API/api';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, { message: 'OTP must be 6 digits' })
    .regex(/^\d{6}$/, { message: 'OTP must be 6 digits' }),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .refine((pwd) => !pwd.includes(' '), {
        message: 'Password cannot contain spaces',
      }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const navigate = useNavigate();
  const [forgotPassword, { isLoading: isSendingEmail }] =
    useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] =
    useVerifyOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const otpValue = otpForm.watch('otp');

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleSendEmail = async (data: EmailFormData) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      toast.success('OTP sent to your email!');
      setEmail(data.email);
      setStep(2);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to send OTP. Please try again.',
        ),
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('OTP resent to your email!');
      otpForm.reset();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to resend OTP. Please try again.',
        ),
      );
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    try {
      const res = await verifyOtp({
        email,
        otp: data.otp,
      }).unwrap();
      setResetToken(res.token);
      setStep(3);
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Invalid OTP. Please try again.'),
      );
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({
        token: resetToken,
        newPassword: data.password,
      }).unwrap();
      toast.success('Password reset successfully!');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to reset password. Please try again.',
        ),
      );
    }
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    const masked = name.slice(0, 2) + '***';
    return `${masked}@${domain}`;
  };

  const renderStepIndicator = () => (
    <div
      className={` ${step === 1 ? 'mb-10 sm:mt-10' : 'my-3'} flex items-center justify-center gap-2`}
    >
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              s === step
                ? 'bg-primary text-white'
                : s < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-200 text-gray-400'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
          {s < 3 && (
            <div
              className={`w-8 h-[2px] transition-colors ${
                s < step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1Email = () => (
    <form
      onSubmit={emailForm.handleSubmit(handleSendEmail)}
      className="space-y-6"
    >
      <div>
        <label className="text-sm lg:text-base uppercase lg:normal-case tracking-wide lg:tracking-normal text-primary lg:text-gray-700 font-semibold lg:font-medium">
          Email address
        </label>

        <div className="mt-3">
          <InputWithIcon
            placeholder="example@mail.com"
            icon={<Mail />}
            className="h-16 rounded-2xl bg-[#f6fff4] border-primary/20"
            {...emailForm.register('email')}
          />
          {emailForm.formState.errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {emailForm.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSendingEmail}
        className="w-full h-16 text-xl rounded-2xl bg-gradient-to-r from-[#11b53c] to-[#008a14] hover:opacity-95"
      >
        {isSendingEmail ? 'Sending...' : 'Send OTP'}
      </Button>
    </form>
  );

  const renderStep2Otp = () => (
    <form
      onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
      className="space-y-6"
    >
      <div className="text-center lg:text-left">
        <p className="text-gray-600 text-sm">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold text-gray-800">
            {maskEmail(email)}
          </span>
        </p>
      </div>

      <div>
        <label className="text-sm lg:text-base uppercase lg:normal-case tracking-wide lg:tracking-normal text-primary lg:text-gray-700 font-semibold lg:font-medium">
          OTP Code
        </label>
        <p className="text-xs text-gray-500 mt-1">6-digit code</p>

        <div className="mt-3">
          <OtpInput
            value={otpValue}
            onChange={(v) =>
              otpForm.setValue('otp', v, { shouldValidate: false })
            }
            disabled={isVerifyingOtp}
            error={otpForm.formState.errors.otp?.message}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isVerifyingOtp}
        className="w-full h-16 text-xl rounded-2xl bg-gradient-to-r from-[#11b53c] to-[#008a14] hover:opacity-95 disabled:opacity-50"
      >
        {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to email
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isSendingEmail}
          className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
        >
          {isSendingEmail ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </form>
  );

  const renderStep3ResetPassword = () => (
    <form
      onSubmit={resetForm.handleSubmit(handleResetPassword)}
      className="space-y-6"
    >
      <div>
        <label className="text-sm lg:text-base uppercase lg:normal-case tracking-wide lg:tracking-normal text-primary lg:text-gray-700 font-semibold lg:font-medium">
          New Password
        </label>

        <div className="mt-3">
          <InputWithIcon
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock />}
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="size-6 text-primary" />
                ) : (
                  <Eye className="size-6 text-primary" />
                )}
              </button>
            }
            autoComplete="new-password"
            className="h-16 rounded-2xl bg-[#f6fff4] border-primary/20"
            {...resetForm.register('password')}
          />
          {resetForm.formState.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {resetForm.formState.errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm lg:text-base uppercase lg:normal-case tracking-wide lg:tracking-normal text-primary lg:text-gray-700 font-semibold lg:font-medium">
          Confirm Password
        </label>

        <div className="mt-3">
          <InputWithIcon
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<ShieldCheck />}
            trailingIcon={
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-6 text-primary" />
                ) : (
                  <Eye className="size-6 text-primary" />
                )}
              </button>
            }
            autoComplete="new-password"
            className="h-16 rounded-2xl bg-[#f6fff4] border-primary/20"
            {...resetForm.register('confirmPassword')}
          />
          {resetForm.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {resetForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isResetting}
        className="w-full h-16 text-xl rounded-2xl bg-gradient-to-r from-[#11b53c] to-[#008a14] hover:opacity-95"
      >
        {isResetting ? 'Resetting...' : 'Reset Password'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setStep(2);
            otpForm.reset();
          }}
          className="flex items-center justify-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to OTP
        </button>
      </div>
    </form>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Forgot Password';
      case 2:
        return 'Verify OTP';
      case 3:
        return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Enter your email to receive a reset code';
      // case 2:
      //   return 'Enter the code sent to your email';
      // case 3:
      //   return 'Choose a new password for your account';
    }
  };

  const getDesktopHeading = () => (
    <div className="hidden lg:block">
      <div>
        <button
          onClick={() =>
            step === 1
              ? navigate(ROUTES.LOGIN)
              : step === 2
                ? setStep(1)
                : setStep(2)
          }
          className="flex items-center gap-2 text-primary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">
            {step === 1 ? 'Back to Login' : 'Back'}
          </span>
        </button>

        <h2
          className={`  text-[2rem] sm:text-[2.5rem] font-bold text-primary leading-tight `}
        >
          {getStepTitle()}
        </h2>
      </div>

      <p className=" text-base sm:text-xl leading-7 sm:leading-9 text-gray-500">
        {getStepDescription()}
      </p>
    </div>
  );

  const getMobileHeading = () => (
    <div className="lg:hidden mb-8">
      <button
        onClick={() =>
          step === 1
            ? navigate(ROUTES.LOGIN)
            : step === 2
              ? setStep(1)
              : setStep(2)
        }
        className="flex items-center gap-2 text-primary hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back</span>
      </button>

      <div className="flex items-start gap-4">
        <div className="w-1.5 h-14 rounded-full bg-primary mt-1" />

        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {getStepTitle()}
          </h2>

          <p className="mt-2 text-lg text-gray-500">
            {getStepDescription()}
          </p>
        </div>
      </div>
    </div>
  );

  const getLeftSectionContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-5xl font-bold text-primary leading-tight">
              Reset Password
            </h2>

            <p className="mt-5 text-xl text-gray-700 max-w-md leading-9">
              Enter your email address and we&apos;ll send you a code
              to reset your password.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <div className="h-[1px] w-20 bg-primary/30" />
              <Leaf className="w-5 h-5 text-primary" />
              <div className="h-[1px] w-20 bg-primary/30" />
            </div>

            <div className="mt-10 bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-5 max-w-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary overflow-hidden shrink-0 flex items-center justify-center">
                  <Lock className="text-white w-6 h-6" />
                </div>
                <p className="text-gray-700 leading-7">
                  Secure password recovery to get you back into your
                  account.
                </p>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-5xl font-bold text-primary leading-tight">
              Verify Code
            </h2>

            <p className="mt-5 text-xl text-gray-700 max-w-md leading-9">
              Check your email for the 1-6 digit verification code.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <div className="h-[1px] w-20 bg-primary/30" />
              <Leaf className="w-5 h-5 text-primary" />
              <div className="h-[1px] w-20 bg-primary/30" />
            </div>

            <div className="mt-10 bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-5 max-w-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary overflow-hidden shrink-0 flex items-center justify-center">
                  <KeyRound className="text-white w-6 h-6" />
                </div>
                <p className="text-gray-700 leading-7">
                  Enter the code sent to your email to verify your
                  identity.
                </p>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-5xl font-bold text-primary leading-tight">
              New Password
            </h2>

            <p className="mt-5 text-xl text-gray-700 max-w-md leading-9">
              Create a strong password to secure your account.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <div className="h-[1px] w-20 bg-primary/30" />
              <Leaf className="w-5 h-5 text-primary" />
              <div className="h-[1px] w-20 bg-primary/30" />
            </div>

            <div className="mt-10 bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-5 max-w-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary overflow-hidden shrink-0 flex items-center justify-center">
                  <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <p className="text-gray-700 leading-7">
                  Use at least 8 characters with no spaces for a
                  secure password.
                </p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="h-dvh sm:bg-[#eef5df] lg:bg-[#eef5df] flex flex-col px-0 sm:px-6 pt-0 sm:pt-6 relative overflow-hidden">
      <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/5" />
        <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-0 h-40 w-full bg-[url('/grass.png')] bg-repeat-x bg-bottom opacity-20" />
      </div>

      <div className="relative z-10 flex items-start lg:items-start justify-center flex-1 overflow-y-auto">
        <div className="w-full h-full bg-transparent lg:bg-[#f8f8f4] lg:rounded-[28px] overflow-hidden">
          <div className="grid lg:grid-cols-2 h-full">
            <div className="relative overflow-hidden hidden lg:block">
              <img
                src="/bg.jpg"
                alt="Nature"
                className="absolute inset-0 h-full w-full object-fill"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-[#ffffffd9] via-[#ffffff80] to-[#00000030]" />

              <div className="relative z-10 flex flex-col h-full p-10 lg:p-14">
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

                <div className="mt-20">{getLeftSectionContent()}</div>

                <div className="flex-1" />
              </div>
            </div>

            <div className="relative z-10 mt-0 sm:mt-13 lg:bg-[#f8f8f4] w-full flex flex-col px-0 py-0 lg:px-12">
              <div className="w-full my-auto bg-white rounded-t-[36px] lg:rounded-[28px] shadow-none lg:shadow-xl border-t border-gray-100 px-6 py-8 sm:p-8 flex flex-col max-sm:h-dvh max-sm:overflow-y-auto sm:min-h-[520px] lg:min-h-[520px] lg:overflow-y-auto">
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

                {getDesktopHeading()}
                {getMobileHeading()}

                {renderStepIndicator()}

                {step === 1 && renderStep1Email()}
                {step === 2 && renderStep2Otp()}
                {step === 3 && renderStep3ResetPassword()}

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

              <div className="border-gray-200 pt-6 hidden sm:block">
                <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-3">
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

                  <div className="flex w-full items-center gap-3 rounded-2xl bg-[#f7faf2] p-4 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Leaf className="h-5 w-5 text-primary" />
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

export default ForgotPassword;
