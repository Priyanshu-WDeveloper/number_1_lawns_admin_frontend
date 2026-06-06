import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarCellProps {
  name: string;
  email?: string;
  profileImage?: string;
  size?: 'sm' | 'md';
}

export function AvatarCell({
  name,
  email,
  profileImage,
  size = 'sm',
}: AvatarCellProps) {
  const [imgError, setImgError] = useState(false);
  const initial = name && /[a-zA-Z]/.test(name.charAt(0)) ? name.charAt(0).toUpperCase() : null;
  const hue = name ? (name.charCodeAt(0) * 137.5) % 360 : 0;
  const bgColor = `hsl(${hue}, 60%, 90%)`;
  const textColor = `hsl(${hue}, 60%, 35%)`;
  const sizeClasses = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm';

  return (
    <div className="flex items-center gap-3">
      {profileImage && !imgError ? (
        <img
          src={profileImage}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses} flex items-center justify-center rounded-full font-semibold`}
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {initial ? (
            <span>{initial}</span>
          ) : (
            <User className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          )}
        </div>
      )}
      <div>
        <span className="font-medium text-[#151515]">{name || '-'}</span>
        {email && <p className="text-xs text-[#6b7280]">{email}</p>}
      </div>
    </div>
  );
}
