import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, Shield, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { InputWithIcon } from '../../components/forms/input-with-icon';
import { Button } from '../../components/ui/button';

const SuperAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (password.length < 8) {
        alert('Password must be atleast 8 characters');
      }
      await login(email, password);
      toast.success('Welcome, Super Admin!');
      navigate('/super-admin/dashboard');
    } catch {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-min bg-[#eef5df] flex flex-col px-6 pt-6 pb-3">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-8xl bg-[#f8f8f4] rounded-[28px] shadow-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-2">
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
                      Super Admin
                    </h1>
                  </div>

                  <div className="mt-20">
                    <h2 className="text-5xl font-bold text-green-900 leading-tight">
                      Admin Control
                    </h2>

                    <p className="mt-5 text-xl text-gray-700 max-w-md leading-9">
                      Access the control panel to manage all
                      administrators
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mt-8">
                      <div className="h-[1px] w-20 bg-green-300" />

                      <Shield className="w-5 h-5 text-green-600" />

                      <div className="h-[1px] w-20 bg-green-300" />
                    </div>

                    {/* Quote Card */}
                    <div className="mt-10 bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-5 max-w-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-600 overflow-hidden shrink-0 flex items-center justify-center">
                          <Shield className="text-white w-6 h-6" />
                        </div>

                        <p className="text-gray-700 leading-7">
                          Secure access to manage all admin users and
                          system settings.
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
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-green-900">
                        Super Admin Access
                      </h2>

                      <p className="text-gray-500 mt-3 text-lg">
                        Enter your credentials to access the control
                        panel
                      </p>
                    </div>

                    {/* Form */}
                    <form
                      onSubmit={handleSubmit}
                      className="mt-10 space-y-6"
                    >
                      {/* Email */}
                      <div>
                        <label className="text-gray-700 font-medium">
                          Email address
                        </label>

                        <div className="mt-2">
                          <InputWithIcon
                            type="email"
                            placeholder="superadmin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail />}
                            required
                            autoComplete="on"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="text-gray-700 font-medium">
                          Password
                        </label>

                        <div className="mt-2">
                          <InputWithIcon
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                            icon={<Lock />}
                            trailingIcon={
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword(!showPassword)
                                }
                                className="focus:outline-none"
                              >
                                <Eye className="size-5" />
                              </button>
                            }
                            required
                            autoComplete="current-password"
                          />
                        </div>
                      </div>

                      {/* Remember */}
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-gray-600">
                          <input
                            type="checkbox"
                            className="accent-green-600 w-4 h-4"
                          />
                          Remember me
                        </label>

                        <button
                          type="button"
                          className="text-green-700 font-medium hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {/* Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 text-lg"
                      >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                      </Button>
                    </form>
                  </div>

                  {/* Bottom Info */}
                  <div className="border-t border-gray-200 px-1 pt-8 pb-4 flex lg:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-700" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700">
                            Secure Access
                          </h4>
                          <p className="text-sm text-gray-500">
                            Protected login
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-700" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700">
                            Full Control
                          </h4>
                          <p className="text-sm text-gray-500">
                            Admin management
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-green-700" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700">
                            System Monitor
                          </h4>
                          <p className="text-sm text-gray-500">
                            Real-time analytics
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

export default SuperAdminLogin;
