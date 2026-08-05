import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[#2563eb] hover:bg-[#1d4ed8] text-[#ffffff] shadow-sm',
  secondary: 'bg-[#ffffff] border border-[#c3c6d7] text-[#131b2e] hover:bg-[#f2f3ff]',
  ghost: 'bg-transparent text-[#2563eb] hover:bg-[#f2f3ff]',
  danger: 'bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-sm',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold',
        'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/45 focus:ring-offset-2 focus:ring-offset-[#faf8ff]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
