import React, { forwardRef } from 'react';

export const Select = forwardRef(
  (
    {
      label,
      error,
      options = [],
      className = '',
      required = false,
      placeholder = 'Select an option',
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
        <select
          ref={ref}
          required={required}
          className={`block w-full text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 py-2 px-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${
            error
              ? 'border-rose-300 dark:border-rose-700 bg-rose-50/30 text-rose-900'
              : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const labelText = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>
        {error && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
