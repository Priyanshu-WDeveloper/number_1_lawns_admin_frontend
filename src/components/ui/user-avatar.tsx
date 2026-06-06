import { useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  image?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getFirstAlpha(name: string): string | null {
  return name && /[a-zA-Z]/.test(name.charAt(0)) ? name.charAt(0).toUpperCase() : null;
}

export function UserAvatar({ image, name, size = 'md', className }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initial = getFirstAlpha(name);

  const sizeClasses = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const fallbackClasses = size === 'lg' ? 'text-xl font-bold' : 'text-sm';
  const iconSize = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
      <Avatar className={`${sizeClasses}${className ? ` ${className}` : ''}`}>
      {image && !imgError ? (
        <AvatarImage src={image} alt={name} onError={() => setImgError(true)} />
      ) : null}
      {(!image || imgError) && (
        <AvatarFallback className={fallbackClasses}>
          {initial ? (
            <span>{initial}</span>
          ) : (
            <User className={iconSize} />
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
