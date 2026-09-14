import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Edit2,
  Trash2,
  UserCheck,
  RotateCcw,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';
import { assetService } from '../services/assetService';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { TableSkeleton } from '../components/common/Skeleton';
import { AssetFormModal } from '../components/assets/AssetFormModal';
import { QRCodeModal } from '../components/assets/QRCodeModal';
import { AssignModal } from '../components/assignments/AssignModal';
import { ReturnModal } from '../components/assignments/ReturnModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportCsv';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Laptop',
  'Desktop',
  'Monitor',
  'Mobile',
  'Tablet',
  'Printer',
  'Keyboard',
  'Mouse',
  'Networking',
  'Server',
  'Other',
];

const STATUSES = ['All', 'Available', 'Assigned', 'Maintenance', 'Retired'];

export const AssetsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters state initialized from URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [warrantyFilter, setWarrantyFilter] = useState(searchParams.get('warranty') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [qrAsset, setQrAsset] = useState(null);
  const [assigningAsset, setAssigningAsset] = useState(null);
  const [returningAsset, setReturningAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        warrantyStatus: warrantyFilter !== 'All' ? warrantyFilter : undefined,
        sortBy,
        sortOrder,
      };

      const res = await assetService.getAssets(params);
      if (res.success) {
        setAssets(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
      showToast('Failed to fetch assets', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, warrantyFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Sync with URL query parameters for bookmarking & easy sharing
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedStatus !== 'All') params.status = selectedStatus;
    if (warrantyFilter !== 'All') params.warranty = warrantyFilter;
    if (currentPage > 1) params.page = currentPage;
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, selectedStatus, warrantyFilter, currentPage, setSearchParams]);

  // Handle URL open modal trigger (e.g. from Dashboard "Add Asset")
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsFormOpen(true);
      setEditingAsset(null);
    }
  }, [searchParams]);

  const handleCreateOrUpdateAsset = async (formData) => {
    setActionLoading(true);
    try {
      if (editingAsset) {
        const res = await assetService.updateAsset(editingAsset._id, formData);
        if (res.success) {
          showToast(`Asset ${formData.assetId} updated successfully`);
          setIsFormOpen(false);
          setEditingAsset(null);
          fetchAssets();
        }
      } else {
        const res = await assetService.createAsset(formData);
        if (res.success) {
          showToast(`Asset ${formData.assetId} registered successfully`);
          setIsFormOpen(false);
          fetchAssets();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    setActionLoading(true);
    try {
      const res = await assetService.deleteAsset(deletingAsset._id);
      if (res.success) {
        showToast(`Asset ${deletingAsset.assetId} deleted`);
        setDeletingAsset(null);
        fetchAssets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAsset = async (assignData) => {
    if (!assigningAsset) return;
    setActionLoading(true);
    try {
      const res = await assetService.assignAsset(assigningAsset._id, assignData);
      if (res.success) {
        showToast(`Asset ${assigningAsset.assetId} assigned successfully`);
        setAssigningAsset(null);
        fetchAssets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnAsset = async (returnData) => {
    if (!returningAsset) return;
    setActionLoading(true);
    try {
      const res = await assetService.returnAsset(returningAsset._id, returnData);
      if (res.success) {
        showToast(`Asset returned. Status is now ${res.data.status}`);
        setReturningAsset(null);
        fetchAssets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to return asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    const csvData = assets.map((a) => ({
      AssetID: a.assetId,
      Name: a.name,
      Category: a.category,
      Brand: a.brand,
      Model: a.model,
      SerialNumber: a.serialNumber,
      Status: a.status,
      Cost: a.purchaseCost,
      PurchaseDate: formatDate(a.purchaseDate),
      WarrantyExpiry: formatDate(a.warrantyExpiry),
      Location: a.location,
      AssignedEmployee: a.assignedTo ? a.assignedTo.name : 'Unassigned',
      EmployeeID: a.assignedTo ? a.assignedTo.employeeId : '',
    }));
    exportToCsv(csvData, `Assets-Export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setWarrantyFilter('All');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    warrantyFilter !== 'All';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
            }`}
        >
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Asset Inventory"
        subtitle="Catalogue of all physical and digital hardware assets across the organization"
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCsv}
              disabled={assets.length === 0}
            >
              Export CSV
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingAsset(null);
                  setIsFormOpen(true);
                }}
              >
                Add Asset
              </Button>
            )}
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by asset ID, model, name, or serial number..."
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

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full lg:w-40 text-xs py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full lg:w-36 text-xs py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>

          {/* Warranty Filter */}
          <select
            value={warrantyFilter}
            onChange={(e) => {
              setWarrantyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full lg:w-40 text-xs py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Warranties</option>
            <option value="expiringSoon">Expiring Soon (30d)</option>
            <option value="active">Active Warranty</option>
            <option value="expired">Expired Warranty</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </Card>

      {/* Asset Data Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : assets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No assets match your search criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your keyword, resetting filters, or register a new asset into the inventory.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Asset Specs</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {assets.map((asset) => (
                  <tr
                    key={asset._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Asset ID */}
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      <button
                        onClick={() => navigate(`/assets/${asset._id}`)}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        <span>{asset.assetId}</span>
                      </button>
                    </td>

                    {/* Asset Specs */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {asset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {asset.brand} • {asset.model}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                        {asset.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge status={asset.status} dot>
                        {asset.status}
                      </Badge>
                    </td>

                    {/* Assigned To */}
                    <td className="py-3 px-4">
                      {asset.assignedTo ? (
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {asset.assignedTo.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {asset.assignedTo.department}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(asset.purchaseCost)}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {asset.location}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View QR Code */}
                        <button
                          onClick={() => setQrAsset(asset)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Generate / Download Asset QR Tag"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Assign / Return */}
                        {isAdmin && asset.status === 'Available' && (
                          <button
                            onClick={() => setAssigningAsset(asset)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Assign to Employee"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && asset.status === 'Assigned' && (
                          <button
                            onClick={() => setReturningAsset(asset)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Return to Inventory"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => navigate(`/assets/${asset._id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details & Lifecycle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingAsset(asset);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Asset"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingAsset(asset)}
                            disabled={asset.status === 'Assigned'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={
                              asset.status === 'Assigned'
                                ? 'Cannot delete assigned asset. Return it first.'
                                : 'Delete Asset'
                            }
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

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={10}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>

      {/* Modals */}
      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAsset(null);
        }}
        onSubmit={handleCreateOrUpdateAsset}
        asset={editingAsset}
        isLoading={actionLoading}
      />

      <QRCodeModal
        isOpen={!!qrAsset}
        onClose={() => setQrAsset(null)}
        asset={qrAsset}
      />

      <AssignModal
        isOpen={!!assigningAsset}
        onClose={() => setAssigningAsset(null)}
        onAssign={handleAssignAsset}
        asset={assigningAsset}
        isLoading={actionLoading}
      />

      <ReturnModal
        isOpen={!!returningAsset}
        onClose={() => setReturningAsset(null)}
        onReturn={handleReturnAsset}
        asset={returningAsset}
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        onConfirm={handleDeleteAsset}
        title="Delete Asset"
        message={`Are you sure you want to permanently delete ${deletingAsset?.name} (${deletingAsset?.assetId})? All historical records for this asset will also be purged.`}
        confirmText="Delete Asset"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AssetsPage;
