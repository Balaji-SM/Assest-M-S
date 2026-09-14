import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Laptop,
  CheckCircle2,
  UserCheck,
  Wrench,
  Archive,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { assetService } from '../services/assetService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportCsv';

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load report stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExportFullInventory = async () => {
    setExporting(true);
    try {
      const res = await assetService.getAssets({ limit: 1000 });
      if (res.success) {
        const rows = res.data.map((a) => ({
          'Asset ID': a.assetId,
          'Asset Name': a.name,
          Category: a.category,
          Brand: a.brand,
          Model: a.model,
          'Serial Number': a.serialNumber,
          Status: a.status,
          'Purchase Cost ($)': a.purchaseCost,
          'Purchase Date': formatDate(a.purchaseDate),
          'Warranty Expiry': formatDate(a.warrantyExpiry),
          Location: a.location,
          'Assigned Employee': a.assignedTo ? a.assignedTo.name : 'Unassigned',
          'Employee Email': a.assignedTo ? a.assignedTo.email : '',
          'Employee Department': a.assignedTo ? a.assignedTo.department : '',
          Description: a.description || '',
        }));

        exportToCsv(
          rows,
          `Enterprise-Asset-Inventory-Report-${new Date().toISOString().split('T')[0]}.csv`
        );
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export inventory report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const statusBreakdown = stats?.charts?.assetsByStatus || [];
  const categoryBreakdown = stats?.charts?.assetsByCategory || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Intelligence & Audit Reports"
        subtitle="Executive inventory analytics, financial valuations, and asset disposition ledger"
        action={
          <Button
            variant="primary"
            icon={Download}
            onClick={handleExportFullInventory}
            isLoading={exporting}
          >
            Export Complete Inventory CSV
          </Button>
        }
      />

      {/* Financial Valuation Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-brand-200/80 dark:border-brand-900/60 bg-gradient-to-br from-brand-50/50 to-white dark:from-brand-950/30 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase text-brand-700 dark:text-brand-300">
            Total Asset Valuation
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(kpis.totalAssetValue || 0)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {kpis.totalAssets || 0} registered hardware assets
          </p>
        </Card>

        <Card className="p-5 border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/30 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">
            Total Maintenance Expenditure
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(kpis.totalMaintenanceCost || 0)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lifetime servicing and diagnostic costs
          </p>
        </Card>

        <Card className="p-5 border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300">
            Deployment Utilization
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {kpis.totalAssets > 0
              ? `${Math.round((kpis.assignedAssets / kpis.totalAssets) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {kpis.assignedAssets} assigned vs {kpis.availableAssets} in storage
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <Card>
          <CardHeader
            title="Asset Distribution by Category"
            subtitle="Quantity and hardware category proportions"
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Count</th>
                    <th className="py-3 px-4">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {categoryBreakdown.map((item) => {
                    const percentage = kpis.totalAssets
                      ? Math.round((item.count / kpis.totalAssets) * 100)
                      : 0;
                    return (
                      <tr key={item.category} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {item.category}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{item.count}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-brand-600 h-full rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-400">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Status Breakdown Table */}
        <Card>
          <CardHeader
            title="Operational Status Breakdown"
            subtitle="Readiness and deployment posture"
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Asset Count</th>
                    <th className="py-3 px-4">Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {statusBreakdown.map((item) => {
                    const percentage = kpis.totalAssets
                      ? Math.round((item.count / kpis.totalAssets) * 100)
                      : 0;
                    return (
                      <tr key={item.status} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {item.status}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{item.count}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-400">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
