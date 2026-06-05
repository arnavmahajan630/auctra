import React from 'react';

interface StatBadgeProps {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'glow';
}

export default function StatBadge({ icon, label, variant = 'default' }: StatBadgeProps) {
  if (variant === 'glow') {
    return (
      <div className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/15 px-4 py-2 text-xs font-semibold text-teal-400">
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-300">
      {icon}
      <span>{label}</span>
    </div>
  );
}
