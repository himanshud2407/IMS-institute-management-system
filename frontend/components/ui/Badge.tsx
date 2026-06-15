import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full tracking-wide uppercase',
        {
          // Color styles
          'bg-primary-50 text-primary-700 border border-primary-200/50': variant === 'primary',
          'bg-slate-100 text-slate-700 border border-slate-200/50': variant === 'secondary',
          'bg-emerald-50 text-emerald-700 border border-emerald-200/50': variant === 'success',
          'bg-amber-50 text-amber-700 border border-amber-200/50': variant === 'warning',
          'bg-rose-50 text-rose-700 border border-rose-200/50': variant === 'danger',
          'bg-blue-50 text-blue-700 border border-blue-200/50': variant === 'info',
        },
        {
          // Sizes
          'px-2 py-0.5 text-[10px]': size === 'sm',
          'px-2.5 py-1 text-[11px]': size === 'md',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
