import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#4B7084] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={[
          'w-full px-3 py-2.5 text-sm rounded-md border border-[#B7D9E5] bg-[#ffffff]',
          'text-[#183446] placeholder:text-[#6A95A7]',
          'focus:outline-none focus:ring-2 focus:ring-[#0090C1]/40 focus:border-[#0090C1]',
          'disabled:bg-[#E4F5FB] disabled:text-[#6A95A7] disabled:cursor-not-allowed',
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
        <label htmlFor={id} className="text-xs font-semibold text-[#4B7084] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={[
          'w-full px-3 py-2.5 text-sm rounded-md border border-[#B7D9E5] bg-[#ffffff]',
          'text-[#183446]',
          'focus:outline-none focus:ring-2 focus:ring-[#0090C1]/40 focus:border-[#0090C1]',
          'disabled:bg-[#E4F5FB] disabled:cursor-not-allowed',
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
