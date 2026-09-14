import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  X,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/common/Skeleton';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { exportToCsv } from '../utils/exportCsv';

const ACTIONS = [
  'All',
  'ASSET_CREATED',
  'ASSET_ASSIGNED',
  'ASSET_RETURNED',
  'MAINTENANCE_STARTED',
  'MAINTENANCE_COMPLETED',
  'ASSET_UPDATED',
  'ASSET_DELETED',
  'EMPLOYEE_CREATED',
  'EMPLOYEE_UPDATED',
  'EMPLOYEE_DELETED',
  'USER_LOGIN',
  'USER_REGISTER',
];

export const ActivitiesPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [actionFilter, setActionFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 15,
        action: actionFilter !== 'All' ? actionFilter : undefined,
        search: searchTerm || undefined,
      };
      const res = await dashboardService.getActivityLogs(params);
      if (res.success) {
        setLogs(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCsv = () => {
    const csvData = logs.map((l) => ({
      Timestamp: formatDate(l.createdAt),
      User: l.userName || 'System',
      Action: l.action,
      Asset: l.assetName || 'N/A',
      Details: l.details || '',
    }));
    exportToCsv(csvData, `Audit-Trail-Export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getActionBadge = (action) => {
    if (action.includes('CREATED') || action.includes('COMPLETED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400';
    }
    if (action.includes('ASSIGNED')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400';
    }
    if (action.includes('RETURNED')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400';
    }
    if (action.includes('MAINTENANCE')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400';
    }
    if (action.includes('DELETED')) {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Audit Activity Log"
        subtitle="Immutable ledger of user actions, hardware lifecycle transitions, and system events"
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCsv}
            disabled={logs.length === 0}
          >
            Export Log CSV
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user name, action, or details..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-56 text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            {ACTIONS.map((act) => (
              <option key={act} value={act}>
                {act === 'All' ? 'All Activity Types' : act.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Activity Log Data Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No audit logs match criteria
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or selecting All Activity Types.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Related Hardware</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatDate(log.createdAt)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-[10px]">
                          {log.userName ? log.userName.slice(0, 1).toUpperCase() : 'U'}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {log.userName || 'System'}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Related Asset */}
                    <td className="py-3 px-4">
                      {log.assetName ? (
                        <span className="font-medium text-brand-600 dark:text-brand-400">
                          {log.assetName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 max-w-md text-slate-600 dark:text-slate-300 leading-relaxed">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={15}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>
    </div>
  );
};

export default ActivitiesPage;
