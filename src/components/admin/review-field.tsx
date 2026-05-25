import type { ReactNode } from 'react';

interface ReviewFieldProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export function ReviewField({ icon, label, value }: ReviewFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.7rem] font-semibold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1.5">
        <span className="stroke-[#9ca3af]">{icon}</span>
        {label}
      </label>
      <div className="text-sm font-medium text-[#111827] px-3.5 py-2.5 bg-[#f9fafb] rounded-lg min-h-[40px] flex items-center">
        {value || '-'}
      </div>
    </div>
  );
}
