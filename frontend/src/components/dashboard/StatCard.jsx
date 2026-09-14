import React from 'react';
import { Card } from '../common/Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'brand',
  onClick,
}) => {
  const colorStyles = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`p-5 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${colorStyles[color] || colorStyles.brand}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
