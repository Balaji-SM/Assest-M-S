import React from 'react';
import {
  Activity,
  PlusCircle,
  UserCheck,
  RotateCcw,
  Wrench,
  Edit,
  Trash2,
  LogIn,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { formatRelativeTime } from '../../utils/formatters';

export const RecentActivitiesList = ({ activities = [] }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'ASSET_CREATED':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'ASSET_ASSIGNED':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-500" />;
      case 'ASSET_RETURNED':
        return <RotateCcw className="w-3.5 h-3.5 text-blue-500" />;
      case 'MAINTENANCE_STARTED':
      case 'MAINTENANCE_COMPLETED':
        return <Wrench className="w-3.5 h-3.5 text-amber-500" />;
      case 'ASSET_UPDATED':
      case 'EMPLOYEE_UPDATED':
        return <Edit className="w-3.5 h-3.5 text-slate-500" />;
      case 'ASSET_DELETED':
      case 'EMPLOYEE_DELETED':
        return <Trash2 className="w-3.5 h-3.5 text-rose-500" />;
      case 'USER_LOGIN':
      case 'USER_REGISTER':
        return <LogIn className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader
        title="Recent System Activities"
        subtitle="Real-time audit events and lifecycle operations"
      />
      <CardBody className="p-0">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No recent activity recorded
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {activities.map((act) => (
              <div
                key={act._id}
                className="flex items-start gap-3 p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getActionIcon(act.action)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {act.userName || 'System'}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                    {act.details || act.action}
                  </p>
                  {act.assetName && (
                    <span className="inline-block mt-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md">
                      {act.assetName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
