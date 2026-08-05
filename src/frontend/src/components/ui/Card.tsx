import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={[
        'bg-[#ffffff] rounded-md border border-[#c3c6d7]',
        'shadow-[0_1px_0_rgba(32,27,22,0.08)]',
        padding ? 'p-6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#c3c6d7] bg-[#f2f3ff] rounded-t-md">
      <h3 className="font-display text-base font-semibold text-[#131b2e]">{title}</h3>
      {action}
    </div>
  );
}
