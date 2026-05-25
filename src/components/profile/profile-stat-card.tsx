interface ProfileStatCardProps {
  label: string;
  value: string | number;
  accentColor?: string;
  delay?: number;
}

export default function ProfileStatCard({ label, value, accentColor = '#16610E', delay = 0 }: ProfileStatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-[#ececec] p-5 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="absolute inset-y-2 left-0 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
      <p className="text-xs font-medium tracking-wide text-[#8a8a8a] uppercase">{label}</p>
      <p className="text-2xl font-bold text-[#151515] mt-1.5">{value}</p>
    </div>
  );
}
