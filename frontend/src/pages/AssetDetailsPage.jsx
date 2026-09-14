import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  Building,
  UserCheck,
  Shield,
  Download,
  Clock,
  Wrench,
  RotateCcw,
  CheckCircle2,
  PlusCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { assetService } from '../services/assetService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { AssignModal } from '../components/assignments/AssignModal';
import { ReturnModal } from '../components/assignments/ReturnModal';

export const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const qrRef = useRef(null);

  const fetchAssetDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await assetService.getAssetById(id);
      if (res.success) {
        setAsset(res.data);
        setHistory(res.history || []);
      } else {
        setError('Asset not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas || !asset) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-${asset.assetId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAssign = async (assignData) => {
    setActionLoading(true);
    try {
      const res = await assetService.assignAsset(asset._id, assignData);
      if (res.success) {
        setIsAssignOpen(false);
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async (returnData) => {
    setActionLoading(true);
    try {
      const res = await assetService.returnAsset(asset._id, returnData);
      if (res.success) {
        setIsReturnOpen(false);
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getTimelineIcon = (action) => {
    switch (action) {
      case 'ASSET_CREATED':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-indigo-500" />;
      case 'RETURNED':
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case 'MAINTENANCE_STARTED':
      case 'MAINTENANCE_COMPLETED':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {error || 'Asset Not Found'}
        </h2>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/assets')}>
          Return to Assets List
        </Button>
      </div>
    );
  }

  const qrUrl = window.location.href;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/assets')}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Asset Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {asset.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800">
                {asset.assetId}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {asset.brand} • {asset.model} • S/N: {asset.serialNumber}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isAdmin && asset.status === 'Available' && (
            <Button
              variant="primary"
              size="sm"
              icon={UserCheck}
              onClick={() => setIsAssignOpen(true)}
            >
              Assign to Employee
            </Button>
          )}
          {isAdmin && asset.status === 'Assigned' && (
            <Button
              variant="primary"
              size="sm"
              icon={RotateCcw}
              onClick={() => setIsReturnOpen(true)}
            >
              Return Asset
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Specifications & Custodian */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Specifications Card */}
          <Card>
            <CardHeader
              title="Hardware Specifications"
              subtitle="Asset metadata and procurement information"
              action={<Badge status={asset.status} dot>{asset.status}</Badge>}
            />
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Category</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {asset.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Brand / Manufacturer</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {asset.brand}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Model Specification</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {asset.model}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Serial Number</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {asset.serialNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Purchase Cost</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(asset.purchaseCost)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Purchase Date</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(asset.purchaseDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Warranty Expiry</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(asset.warrantyExpiry)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Physical Location</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {asset.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Added to System</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(asset.createdAt)}
                  </span>
                </div>
              </div>

              {asset.description && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Description / Configuration Notes:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {asset.description}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Current Custodian / Assigned Employee Card */}
          <Card>
            <CardHeader
              title="Current Custody & Deployment"
              subtitle="Employee currently responsible for this equipment"
            />
            <CardBody>
              {asset.assignedTo ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/60">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20">
                      {asset.assignedTo.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {asset.assignedTo.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {asset.assignedTo.designation} • {asset.assignedTo.department}
                      </p>
                      <p className="text-[11px] font-mono text-brand-600 dark:text-brand-400 mt-0.5">
                        ID: {asset.assignedTo.employeeId} • {asset.assignedTo.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs text-slate-500 shrink-0">
                    <p>
                      Assigned on:{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(asset.assignedDate)}
                      </span>
                    </p>
                    {asset.expectedReturnDate && (
                      <p className="mt-0.5">
                        Expected Return:{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(asset.expectedReturnDate)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Asset is currently unassigned and in storage.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Ready to be deployed to any active employee.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Lifecycle History Timeline */}
          <Card>
            <CardHeader
              title="Lifecycle Audit Timeline"
              subtitle={`Complete historical ledger (${history.length} logged events)`}
            />
            <CardBody>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No lifecycle history recorded for this asset yet.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {history.map((record) => (
                    <div key={record._id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-0 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {getTimelineIcon(record.action)}
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                            {record.action.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(record.date)}
                          </span>
                        </div>

                        {record.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {record.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                          {record.employeeName && (
                            <span>Employee: {record.employeeName}</span>
                          )}
                          {record.performedByName && (
                            <span>Logged by: {record.performedByName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: QR Code & Printable Asset Tag */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Asset QR Tag"
              subtitle="Scan with mobile camera for instant asset retrieval"
            />
            <CardBody className="flex flex-col items-center text-center p-6 space-y-4">
              <div
                ref={qrRef}
                className="p-5 rounded-2xl bg-white border-2 border-dashed border-slate-300 shadow-sm flex flex-col items-center max-w-[220px]"
              >
                <QRCodeCanvas
                  value={qrUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
                <span className="mt-2 font-mono text-sm font-bold text-slate-900 block">
                  {asset.assetId}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {asset.serialNumber}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                className="w-full"
                onClick={handleDownloadQR}
              >
                Download Printable QR
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Assignment & Return Modals */}
      <AssignModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssign}
        asset={asset}
        isLoading={actionLoading}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        onReturn={handleReturn}
        asset={asset}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AssetDetailsPage;
