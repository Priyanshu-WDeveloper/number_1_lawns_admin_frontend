import { ArrowLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileHeroProps {
  profileImage?: string;
  fullName: string;
  email: string;
  initials: string;
  status: string;
  role: number;
  balance: number;
  onBack: () => void;
}

export default function ProfileHero({
  profileImage,
  fullName,
  email,
  initials,
  status: _status,
  role,
  balance,
  onBack,
}: ProfileHeroProps) {


  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16610E] via-[#1d7a14] to-[#2a9d1e] pb-10 shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <div className="absolute -bottom-6 left-0 right-0 rounded-t-[36px]" />

      <div className="relative p-6 sm:p-8 pb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-white/30 shadow-xl">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">
                {fullName}
              </h1>
              <p className="text-white/70 mt-0.5">{email}</p>
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
                {/* <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {status}
                </span> */}
                {role === 1 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/25">
                    Super Admin
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center min-w-[130px] shrink-0">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide">
              Balance
            </p>
            <p className="text-white text-2xl font-bold mt-0.5">
              ${balance ?? 0}
            </p>
          </div> */}

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg px-4 py-3 min-w-[150px] shadow-lg transition-all duration-300 hover:scale-[1.02]">
            {/* Glow */}
            <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex items-center gap-3">
              {/* Icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <Wallet className="h-4 w-4 text-white" />
              </div>

              {/* Text */}
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Balance
                </p>

                <div className="flex items-center gap-1 pt-1">
                  <h2 className="text-2xl font-bold leading-none text-white">
                    $ {balance}
                  </h2>
                </div>
              </div>
            </div>

            {/* Shine */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
