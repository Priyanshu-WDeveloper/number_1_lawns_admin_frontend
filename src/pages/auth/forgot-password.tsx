import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Mail, ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { InputWithIcon } from '../../components/forms/input-with-icon';
import { Button } from '../../components/ui/button';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log(data);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Password reset link sent to your email!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-full h-screen bg-[#eef5df] flex flex-col px-6 pt-6 pb-3">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full max-w-8xl bg-[#f8f8f4] rounded-[28px] shadow-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="grid h-full lg:grid-cols-2">
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
                    <div className="w-12 h-12 rounded-full bg-green-600 shrink-0 flex items-center justify-center p-[2px]">
                      <img
                        src="/image.png"
                        alt="Logo"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>

                    <h1 className="text-3xl font-bold text-green-800">
                      No. 1 Lawns
                    </h1>
                  </div>

                  <div className="mt-20">
                    <h2 className="text-5xl font-bold text-green-900 leading-tight">
                      Reset Password
                    </h2>

                    <p className="mt-5 text-xl text-gray-700 max-w-md leading-9">
                      Enter your email address and we&apos;ll send you
                      a link to reset your password.
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mt-8">
                      <div className="h-[1px] w-20 bg-green-300" />

                      <Leaf className="w-5 h-5 text-green-600" />

                      <div className="h-[1px] w-20 bg-green-300" />
                    </div>

                    {/* Quote Card */}
                    <div className="mt-10 bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-5 max-w-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-600 overflow-hidden shrink-0 flex items-center justify-center">
                          <Lock className="text-white w-6 h-6" />
                        </div>

                        <p className="text-gray-700 leading-7">
                          Secure password recovery to get you back
                          into your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1" />
                </div>
              </div>

              {/* Right Section */}
              <div className="bg-[#f8f8f4] flex items-center justify-center p-8 lg:px-12 lg:py-6">
                <div>
                  <div className="w-full max-w-2xl bg-white rounded-[28px] shadow-lg border border-gray-100 p-8">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 text-green-700 hover:text-green-800 mb-6 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span className="font-medium">
                        Back to Login
                      </span>
                    </button>

                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-green-900">
                        Forgot Password
                      </h2>

                      <p className="text-gray-500 mt-3 text-lg">
                        Enter your email to receive a reset link
                      </p>
                    </div>

                    {/* Form */}
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="mt-10 space-y-6"
                    >
                      {/* Email */}
                      <div>
                        <label className="text-gray-700 font-medium">
                          Email address
                        </label>

                        <div className="mt-2">
                          <InputWithIcon
                            placeholder="example@mail.com"
                            icon={<Mail />}
                            {...register('email')}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 text-lg"
                      >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </form>
                  </div>

                  {/* Bottom Info */}
                  <div className="border-t border-gray-200 px-1 pt-8 pb-4 flex lg:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-700" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700">
                            Eco Friendly
                          </h4>
                          <p className="text-sm text-gray-500">
                            Sustainable solutions
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-700" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700">
                            Grow Together
                          </h4>
                          <p className="text-sm text-gray-500">
                            Community & support
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-700" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700">
                            Better Future
                          </h4>
                          <p className="text-sm text-gray-500">
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
        </div>
      </div>
      {/* Bottom Footer */}
      <div className="w-full px-10 pt-5">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[15px] text-[#6d6d6d]">
          <span>© 2026 No. 1 Lawns. All rights reserved.</span>

          <span className="text-[#bdbdbd]">|</span>

          <button className="hover:text-green-700 transition">
            Privacy Policy
          </button>

          <span className="text-[#bdbdbd]">|</span>

          <button className="hover:text-green-700 transition">
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
