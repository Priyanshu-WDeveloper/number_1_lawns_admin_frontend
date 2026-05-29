import {
  useRef,
  useCallback,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6 as const;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const OtpInput = ({
  value,
  onChange,
  disabled,
  error,
}: OtpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < OTP_LENGTH) {
      inputRefs.current[index]?.focus();
    }
  }, []);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d$/.test(digit)) return;
    if (index > value.length) return;

    const chars = value.split('');
    chars[index] = digit;
    onChange(chars.join(''));

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (value[index]) {
        const chars = value.split('');
        chars[index] = '';
        onChange(chars.join(''));
      } else if (index > 0) {
        const chars = value.split('');
        chars[index - 1] = '';
        onChange(chars.join(''));
        focusInput(index - 1);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }

    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (pasted) {
      onChange(pasted);
      focusInput(Math.min(pasted.length - 1, OTP_LENGTH - 1));
    }
  };

  return (
    <div>
      <div
        className="flex items-center justify-center gap-2 sm:gap-3"
        onPaste={handlePaste}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className={cn(
              'h-16 w-14 sm:w-16 rounded-2xl border text-center text-2xl font-semibold text-gray-900 outline-none transition-all duration-200',
              'focus:outline-none focus:ring-0',
              value[index]
                ? 'border-primary bg-primary/[0.04]'
                : 'border-[#D8DEE4] bg-white hover:border-[#C5CDD8]',
              error
                ? 'border-red-400 focus:border-red-500'
                : 'focus:border-primary',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default OtpInput;
