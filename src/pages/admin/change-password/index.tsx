import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

import { useChangePasswordMutation } from '@/API/api';

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),

    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeAdminPasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async () => {
    setSubmitted(true);

    const result = changePasswordSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        currentPassword: fieldErrors.currentPassword?.[0],
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });

      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await changePassword({
        oldPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();

      toast.success('Password updated successfully');

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSubmitted(false);

      onOpenChange(false);
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data: { message?: string } }).data?.message
          : undefined;
      toast.error(message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          setErrors({});
          setSubmitted(false);

          setForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
      }}
    >
      <DialogContent
        className="
          [&>button]:hidden
          w-[calc(100%-20px)]
          sm:max-w-xl
          overflow-hidden
          rounded-[36px]
          border-0
          bg-transparent
          p-0
          shadow-[0_30px_90px_rgba(0,0,0,0.22)]
        "
      >
        {/* Header */}
        <div className="overflow-hidden rounded-[36px] bg-white">
          <div
            className="
            relative 
            rounded-t-[36px]
            bg-gradient-to-br
            from-emerald-600
            via-green-600
            to-emerald-700
            px-5
            pb-4 sm:pb-12
            pt-6
            sm:px-8
            sm:pt-8
            sm:pb-18
          "
          >
            {/* Background glow */}
            <div className="hidden sm:block absolute inset-0 overflow-hidden">
              <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

              <div className="absolute right-20 top-20 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute -bottom-12 left-0 h-36 w-36 rounded-full bg-black/10 blur-3xl" />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="
                  mb-7
        absolute right-3 top-3 z-20
        flex h-9 w-9 items-center justify-center
        rounded-full
        bg-white/15
        text-white/80
        backdrop-blur-md
        transition-all
        hover:bg-white/25
        hover:text-white
        sm:right-5 sm:top-5
        sm:h-11 sm:w-11
      "
            >
              <X className="h-5 w-5" />
            </button>

            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <DialogTitle
                    className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-white
                    sm:text-3xl
                  "
                  >
                    Change Password
                  </DialogTitle>

                  <p className="mt-2 hidden text-sm leading-relaxed text-green-50/90 sm:block">
                    Update your credentials and secure your account
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Floating Lock Card */}
            {/* <div
              className="
              absolute left-1/2 bottom-0 z-20
              flex h-24 w-24
              -translate-x-1/2 translate-y-1/2
              items-center justify-center
              rounded-[32px]
              border-[6px] border-white
              bg-white
              shadow-[0_20px_50px_rgba(0,0,0,0.18)]
            "
            > */}
            <div className="hidden sm:flex absolute left-1/2 bottom-0 z-20 h-24 w-24 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-8 border-white bg-white shadow-xl">
              <ShieldCheck className="h-10 w-10 text-green-600" />
            </div>
            {/* </div> */}
          </div>

          {/* Body */}
          <div
            className="
            relative
            rounded-b-[36px]
            bg-white
            px-5
            pb-5
            pt-10
            sm:px-8
            sm:pb-7
            sm:pt-24
          "
          >
            <div className="space-y-4 sm:space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-800">
                  Current Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={form.currentPassword}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        currentPassword: e.target.value,
                      });

                      if (submitted && errors.currentPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          currentPassword: undefined,
                        }));
                      }
                    }}
                    disabled={loading}
                    className={`
                    h-12 sm:h-14 rounded-[20px] border
                    bg-zinc-50 pl-12 pr-12
                    text-base
                    shadow-sm
                    transition-all
                    focus-visible:ring-2
                    focus-visible:ring-green-500
                    ${
                      submitted && errors.currentPassword
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : 'border-zinc-200'
                    }
                  `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="
                    absolute right-4 top-1/2
                    -translate-y-1/2
                    text-zinc-500
                    transition-colors
                    hover:text-zinc-800
                  "
                  >
                    {showCurrent ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {submitted && errors.currentPassword && (
                  <p className="pl-1 text-sm text-red-500">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-800">
                  New Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={form.newPassword}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        newPassword: e.target.value,
                      });

                      if (submitted && errors.newPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          newPassword: undefined,
                        }));
                      }
                    }}
                    disabled={loading}
                    className={`
                    h-12 sm:h-14 rounded-[20px] border
                    bg-zinc-50 pl-12 pr-12
                    text-base
                    shadow-sm
                    transition-all
                    focus-visible:ring-2
                    focus-visible:ring-green-500
                    ${
                      submitted && errors.newPassword
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : 'border-zinc-200'
                    }
                  `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="
                    absolute right-4 top-1/2
                    -translate-y-1/2
                    text-zinc-500
                    transition-colors
                    hover:text-zinc-800
                  "
                  >
                    {showNew ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {submitted && errors.newPassword && (
                  <p className="pl-1 text-sm text-red-500">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-800">
                  Confirm Password
                </label>

                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        confirmPassword: e.target.value,
                      });

                      if (submitted && errors.confirmPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                      }
                    }}
                    disabled={loading}
                    className={`
                    h-12 sm:h-14 rounded-[20px] border
                    bg-zinc-50 pl-12 pr-12
                    text-base
                    shadow-sm
                    transition-all
                    focus-visible:ring-2
                    focus-visible:ring-green-500
                    ${
                      submitted && errors.confirmPassword
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : 'border-zinc-200'
                    }
                  `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="
                    absolute right-4 top-1/2
                    -translate-y-1/2
                    text-zinc-500
                    transition-colors
                    hover:text-zinc-800
                  "
                  >
                    {showConfirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {submitted && errors.confirmPassword && (
                  <p className="pl-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-100 pt-5 sm:pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => onOpenChange(false)}
                    className="
                    h-12
                    rounded-[20px]
                    border-zinc-300
                    bg-white
                    text-base
                    font-medium
                    text-zinc-700
                    shadow-sm
                    transition-all
                    hover:bg-zinc-100
                    hover:text-zinc-900
                    active:scale-[0.98]
                    sm:h-14
                  "
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="
                    h-12
                    rounded-[20px]
                    bg-gradient-to-r
                    from-green-600
                    to-emerald-600
                    text-base
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-green-600/20
                    transition-all
                    hover:scale-[1.01]
                    hover:from-green-700
                    hover:to-emerald-700
                    active:scale-[0.98]
                    disabled:opacity-70
                  "
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Update'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ChangePasswordPage() {
  const [open, setOpen] = useState(true);

  const navigate = useNavigate();

  return (
    <ChangeAdminPasswordDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);

        if (!v) navigate(-1);
      }}
    />
  );
}
