import React from 'react';
import { getStatusBadgeClass } from '../../utils/formatters';

export const Badge = ({ children, status, variant, dot = false, className = '' }) => {
  const badgeClass = status ? getStatusBadgeClass(status) : variant || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass} ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
};
