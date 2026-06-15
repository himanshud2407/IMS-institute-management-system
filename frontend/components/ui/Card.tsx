import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outlined';
  hoverable?: boolean;
}

export const Card = ({
  className,
  variant = 'default',
  hoverable = false,
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={clsx(
        'rounded-xl transition-all duration-300 overflow-hidden',
        {
          // Default: clean slate card with shadow
          'bg-white border border-slate-100 shadow-xs shadow-slate-100/50': variant === 'default',
          // Glass: translucent glassmorphic look
          'glass-card': variant === 'glass',
          // Outlined: clear line border, no shadow
          'border border-slate-200 bg-transparent': variant === 'outlined',
        },
        {
          'hover:-translate-y-1 hover:shadow-md hover:border-slate-200/80': hoverable,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clsx('px-6 py-5 border-b border-slate-100/80 bg-linear-to-b from-white/50 to-white/10', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={clsx('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clsx('px-6 py-4 border-t border-slate-100 bg-slate-50/50', className)}
      {...props}
    >
      {children}
    </div>
  );
};
