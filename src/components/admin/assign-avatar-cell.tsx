import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarCellProps {
  customId?: string;
  name: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  profileImage?: string;
  size?: 'sm' | 'md';
}

export function AssignAvatarCell({
  customId,
  name,
  countryCode,
  phoneNumber,
  email,
  address,
  profileImage,
  size = 'sm',
}: AvatarCellProps) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ?.split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const hue = name ? (name.charCodeAt(0) * 137.5) % 360 : 0;
  const bgColor = `hsl(${hue}, 60%, 90%)`;
  const textColor = `hsl(${hue}, 60%, 35%)`;

  const avatarSize =
    size === 'sm' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base';

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-start gap-3">
      {profileImage && !imgError ? (
        <img
          src={profileImage}
          alt={name}
          onError={() => setImgError(true)}
          className={`${avatarSize} rounded-full object-cover flex-shrink-0`}
        />
      ) : (
        <div
          className={`${avatarSize} flex items-center justify-center rounded-full font-semibold flex-shrink-0`}
          style={{
            backgroundColor: bgColor,
            color: textColor,
          }}
        >
          {initials ? (
            <span>{initials}</span>
          ) : (
            <User className={iconSize} />
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="font-medium text-[#151515]">
          {customId} - {name}
        </div>

        <div className="text-sm text-[#4b5563]">
          {countryCode} {phoneNumber}
          {email && (
            <>
              <span className="mx-2">•</span>
              <span>{email}</span>
            </>
          )}
        </div>

        {address && (
          <div className="text-xs text-[#6b7280] truncate">
            {address}
          </div>
        )}
      </div>
    </div>
  );
}
