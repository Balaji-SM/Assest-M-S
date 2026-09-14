import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            required={required}
            className={`block w-full text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 ${
              Icon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 py-2 ${
              error
                ? 'border-rose-300 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
