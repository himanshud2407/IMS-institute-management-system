import React from 'react';
import clsx from 'clsx';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullPage?: boolean;
}

export const LoadingSpinner = ({
  size = 'md',
  className,
  fullPage = false,
}: LoadingSpinnerProps) => {
  const spinner = (
    <div
      className={clsx(
        'animate-spin rounded-full border-t-transparent border-primary-600',
        {
          'w-5 h-5 border-2': size === 'sm',
          'w-8 h-8 border-3': size === 'md',
          'w-12 h-12 border-4': size === 'lg',
          'w-16 h-16 border-4': size === 'xl',
        },
        className
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/60 backdrop-blur-xs">
        {spinner}
        <p className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading Institute Management System...
        </p>
      </div>
    );
  }

  return spinner;
};
