import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#ffffff]/55 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={[
          'relative w-full bg-[#ffffff] rounded-md border border-[#c3c6d7] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.18)]',
          'flex flex-col max-h-[90vh]',
          sizeClasses[size],
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c3c6d7]">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#505f76] hover:text-[#131b2e] transition-colors rounded-md p-1 hover:bg-[#f2f3ff] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#c3c6d7] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
