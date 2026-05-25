interface ProfileFieldProps {
  label: string;
  value: string | number | undefined | null;
  fullWidth?: boolean;
}

export default function ProfileField({ label, value, fullWidth }: ProfileFieldProps) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-medium tracking-wide text-[#8a8a8a] uppercase">{label}</p>
      <div className="mt-1 bg-[#f9fafb] border border-transparent rounded-lg px-3 py-2 min-h-[38px] flex items-center">
        <p className="text-[#151515] font-medium">{value ?? '-'}</p>
      </div>
    </div>
  );
}
