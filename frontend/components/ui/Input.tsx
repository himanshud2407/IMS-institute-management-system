import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 animate-fade-in">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-400 select-none pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            className={clsx(
              // Base Input styling
              'w-full px-4 py-2.5 bg-white text-slate-800 border rounded-lg text-sm shadow-sm transition-all duration-200 outline-hidden',
              
              // Spacing adjustment if icon is present
              {
                'pl-10': !!leftIcon,
                'pr-10': !!rightIcon,
              },

              // Normal state border & focus
              {
                'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100': !error,
                'border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100': !!error,
              }
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-slate-400">
              {rightIcon}
            </span>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p className="text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
