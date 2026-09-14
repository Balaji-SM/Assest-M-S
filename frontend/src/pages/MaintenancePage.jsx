import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  Trash2,
  X,
} from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { TableSkeleton } from '../components/common/Skeleton';
import { MaintenanceFormModal } from '../components/maintenance/MaintenanceFormModal';
import { CompleteMaintenanceModal } from '../components/maintenance/CompleteMaintenanceModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const MaintenancePage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [completingLog, setCompletingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchMaintenance = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchTerm || undefined,
      };

      const res = await maintenanceService.getMaintenanceLogs(params);
      if (res.success) {
        setLogs(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
      showToast('Failed to fetch maintenance logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const handleCreateMaintenance = async (formData) => {
    setActionLoading(true);
    try {
      const res = await maintenanceService.createMaintenance(formData);
      if (res.success) {
        showToast('Asset marked for maintenance successfully');
        setIsFormOpen(false);
        fetchMaintenance();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule maintenance', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMaintenance = async (updateData) => {
    if (!completingLog) return;
    setActionLoading(true);
    try {
      const res = await maintenanceService.updateMaintenance(completingLog._id, updateData);
      if (res.success) {
        showToast('Maintenance completed and asset is now Available');
        setCompletingLog(null);
        fetchMaintenance();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete maintenance', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!deletingLog) return;
    setActionLoading(true);
    try {
      const res = await maintenanceService.deleteMaintenance(deletingLog._id);
      if (res.success) {
        showToast('Maintenance record removed');
        setDeletingLog(null);
        fetchMaintenance();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove record', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const activeCount = logs.filter((l) => l.status === 'In Progress').length;
  const completedCount = logs.filter((l) => l.status === 'Completed').length;
  const totalCost = logs.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Maintenance & Repairs"
        subtitle="Manage hardware servicing, diagnostic repairs, warranty claims, and total overhaul costs"
        action={
          isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsFormOpen(true)}
            >
              Log Maintenance
            </Button>
          )
        }
      />

      {/* Summary KPI Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Currently in Service</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {activeCount} active
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Completed Tickets</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {completedCount} repaired
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Page Maintenance Cost</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalCost)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by repair issue or reason..."
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['All', 'In Progress', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Maintenance Records Data Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No maintenance records found
            </h3>
            <p className="text-xs text-slate-500">
              Hardware health is optimal or no repair tickets match the active filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Service Provider</th>
                  <th className="py-3 px-4">Service Date</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Equipment */}
                    <td className="py-3 px-4">
                      {log.asset ? (
                        <div>
                          <button
                            onClick={() => navigate(`/assets/${log.asset._id}`)}
                            className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                          >
                            <span>{log.asset.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.asset.assetId} • S/N: {log.asset.serialNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Asset Removed</span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {log.reason}
                      </p>
                      {log.notes && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {log.notes}
                        </p>
                      )}
                    </td>

                    {/* Service Provider */}
                    <td className="py-3 px-4 font-medium">{log.serviceProvider}</td>

                    {/* Dates */}
                    <td className="py-3 px-4">
                      <div>
                        <span>{formatDate(log.maintenanceDate)}</span>
                        {log.completedDate && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                            Done {formatDate(log.completedDate)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(log.cost)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge status={log.status} dot>
                        {log.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && log.status === 'In Progress' && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => setCompletingLog(log)}
                          >
                            Complete
                          </Button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setDeletingLog(log)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
          pageSize={10}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>

      {/* Modals */}
      <MaintenanceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateMaintenance}
        isLoading={actionLoading}
      />

      <CompleteMaintenanceModal
        isOpen={!!completingLog}
        onClose={() => setCompletingLog(null)}
        onComplete={handleCompleteMaintenance}
        log={completingLog}
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={!!deletingLog}
        onClose={() => setDeletingLog(null)}
        onConfirm={handleDeleteLog}
        title="Remove Maintenance Ticket"
        message={`Are you sure you want to delete this maintenance record for ${deletingLog?.asset?.name}? If the ticket is currently In Progress, the asset status will be restored to Available.`}
        confirmText="Delete Ticket"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default MaintenancePage;
