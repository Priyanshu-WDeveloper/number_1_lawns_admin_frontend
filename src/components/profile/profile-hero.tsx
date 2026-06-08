import { useRef } from 'react';
import { ArrowLeft, Camera, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';

interface ProfileHeroProps {
  profileImage?: string;
  fullName: string;
  email: string;
  status: string;
  role: number;
  balance: number;
  onBack: () => void;
  isEditing?: boolean;
  onEditClick?: () => void;
  onProfileImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHero({
  profileImage,
  fullName,
  email,

  status: _status,
  role,
  onBack,
  isEditing,
  onEditClick,
  onProfileImageChange,
}: ProfileHeroProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 pb-10 shadow-lg">
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
            <div className="relative">
              <UserAvatar image={profileImage} name={fullName} size="lg" className="h-20 w-20 ring-4 ring-white/30 shadow-xl" />
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onProfileImageChange}
                  />
                </>
              )}
            </div>
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
          <button
            type="button"
            onClick={onEditClick}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 cursor-pointer group"
          >
            <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 transition-all duration-300 ${isEditing ? 'bg-white text-[#0f5b0c]' : 'bg-white/10 group-hover:bg-white/20'}`}
              >
                <Pencil
                  className={`h-4 w-4 transition-all duration-300 ${isEditing ? 'text-[#0f5b0c]' : 'text-white'}`}
                />
              </div>
              {/* <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Profile
                </p>
                <p className="text-sm font-bold text-white leading-none pt-1">
                  {isEditing ? 'Cancel' : 'Edit Admin'}
                </p>
              </div> */}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          </button>
        </div>
      </div>
    </div>
  );
}
