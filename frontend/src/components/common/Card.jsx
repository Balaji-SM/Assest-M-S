import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-card transition-all duration-200 ${
        hover ? 'hover:shadow-soft hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div
      className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${className}`}
    >
      <div>
        {title && (
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div
      className={`px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl ${className}`}
    >
      {children}
    </div>
  );
};
