import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, ExternalLink, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { formatDate } from '../../utils/formatters';

export const WarrantyAlerts = ({ alerts = [] }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-amber-200/70 dark:border-amber-900/50">
      <CardHeader
        title="Warranty Expiring Soon"
        subtitle="Assets requiring renewal or support extension within 30 days"
        action={
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            {alerts.length} Critical Alert{alerts.length !== 1 ? 's' : ''}
          </span>
        }
      />
      <CardBody className="p-0">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            <ShieldAlert className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            All asset warranties are in good standing (no expiries within 30 days).
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {alerts.map((asset) => (
              <div
                key={asset._id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {asset.name}
                      </span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {asset.assetId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {asset.brand} {asset.model} • Expires {formatDate(asset.warrantyExpiry)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      asset.daysRemaining <= 10
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900'
                    }`}
                  >
                    Expires in {asset.daysRemaining} days
                  </span>

                  <button
                    onClick={() => navigate(`/assets/${asset._id}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Asset Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
