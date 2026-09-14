import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Laptop,
  CheckCircle2,
  UserCheck,
  Wrench,
  Archive,
  Users,
  DollarSign,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/dashboard/StatCard';
import { StatusChart } from '../components/dashboard/StatusChart';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { AssignmentsChart } from '../components/dashboard/AssignmentsChart';
import { WarrantyAlerts } from '../components/dashboard/WarrantyAlerts';
import { RecentActivitiesList } from '../components/dashboard/RecentActivitiesList';
import { Skeleton } from '../components/common/Skeleton';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [statsRes, actRes] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivities(6),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (actRes.success) setActivities(actRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to fetch dashboard metrics. Please verify backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};
  const warrantyAlerts = stats?.warrantyAlerts || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Operations Overview"
        subtitle="Live telemetry and inventory performance across organization assets"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              isLoading={refreshing}
              onClick={() => fetchDashboardData(true)}
            >
              Refresh
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/assets?action=new')}
              >
                Add Asset
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Assets"
          value={kpis.totalAssets || 0}
          subtitle={`Valuation ${formatCurrency(kpis.totalAssetValue || 0)}`}
          icon={Laptop}
          color="brand"
          onClick={() => navigate('/assets')}
        />
        <StatCard
          title="Available"
          value={kpis.availableAssets || 0}
          subtitle="Ready to deploy"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/assets?status=Available')}
        />
        <StatCard
          title="Assigned"
          value={kpis.assignedAssets || 0}
          subtitle="In employee hands"
          icon={UserCheck}
          color="indigo"
          onClick={() => navigate('/assets?status=Assigned')}
        />
        <StatCard
          title="Maintenance"
          value={kpis.maintenanceAssets || 0}
          subtitle={`Spend ${formatCurrency(kpis.totalMaintenanceCost || 0)}`}
          icon={Wrench}
          color="amber"
          onClick={() => navigate('/maintenance')}
        />
        <StatCard
          title="Retired"
          value={kpis.retiredAssets || 0}
          subtitle="Decommissioned"
          icon={Archive}
          color="slate"
          onClick={() => navigate('/assets?status=Retired')}
        />
        <StatCard
          title="Employees"
          value={kpis.totalEmployees || 0}
          subtitle="Active directory"
          icon={Users}
          color="purple"
          onClick={() => navigate('/employees')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusChart data={charts.assetsByStatus || []} />
        <CategoryChart data={charts.assetsByCategory || []} />
        <AssignmentsChart data={charts.monthlyAssignments || []} />
      </div>

      {/* Warranty Alerts & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WarrantyAlerts alerts={warrantyAlerts} />
        <RecentActivitiesList activities={activities} />
      </div>
    </div>
  );
};

export default DashboardPage;
