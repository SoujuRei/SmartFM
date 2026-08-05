import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span
        className="material-symbols-outlined text-[48px] text-[#c3c6d7] mb-4"
        style={{ fontVariationSettings: "'wght' 200" }}
      >
        {icon}
      </span>
      <h3 className="font-display text-base font-semibold text-[#131b2e] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#505f76] max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
