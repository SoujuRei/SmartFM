import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#505f76] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={[
          'w-full px-3 py-2.5 text-sm rounded-md border border-[#c3c6d7] bg-[#ffffff]',
          'text-[#131b2e] placeholder:text-[#737686]',
          'focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40 focus:border-[#2563eb]',
          'disabled:bg-[#f2f3ff] disabled:text-[#737686] disabled:cursor-not-allowed',
          'transition-all duration-150',
          error ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/30' : '',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-[#ba1a1a] mt-0.5">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, id, className = '', children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#505f76] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={[
          'w-full px-3 py-2.5 text-sm rounded-md border border-[#c3c6d7] bg-[#ffffff]',
          'text-[#131b2e]',
          'focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40 focus:border-[#2563eb]',
          'disabled:bg-[#f2f3ff] disabled:cursor-not-allowed',
          'transition-all duration-150',
          error ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/30' : '',
          className,
        ].join(' ')}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#ba1a1a] mt-0.5">{error}</p>}
    </div>
  );
}
