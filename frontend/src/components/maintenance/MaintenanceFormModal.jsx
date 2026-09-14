import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { assetService } from '../../services/assetService';
import { Wrench, Info } from 'lucide-react';

export const MaintenanceFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [reason, setReason] = useState('');
  const [cost, setCost] = useState('');
  const [serviceProvider, setServiceProvider] = useState('Internal IT Support');
  const [maintenanceDate, setMaintenanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchAssets = async () => {
        try {
          // Fetch non-maintenance assets
          const res = await assetService.getAssets({ limit: 100 });
          if (res.success) {
            setAvailableAssets(
              res.data.filter((a) => a.status !== 'Maintenance' && a.status !== 'Retired')
            );
          }
        } catch (err) {
          console.error('Failed to load assets for maintenance:', err);
        }
      };
      fetchAssets();
      setSelectedAssetId('');
      setReason('');
      setCost('');
      setServiceProvider('Internal IT Support');
      setMaintenanceDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setError('Please select an asset to service.');
      return;
    }
    if (!reason.trim()) {
      setError('Please describe the repair or maintenance reason.');
      return;
    }

    onSubmit({
      assetId: selectedAssetId,
      reason: reason.trim(),
      cost: cost ? Number(cost) : 0,
      serviceProvider: serviceProvider.trim(),
      maintenanceDate,
      notes: notes.trim(),
    });
  };

  const assetOptions = availableAssets.map((a) => ({
    value: a._id,
    label: `${a.name} (${a.assetId} - Current: ${a.status})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch Asset for Maintenance"
      subtitle="Schedule hardware repair, battery service, or diagnostics"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Dispatching this hardware changes its status to <strong>Maintenance</strong>. If
            previously assigned to an employee, custody will be released for the repair period.
          </span>
        </div>

        {error && (
          <p className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </p>
        )}

        <Select
          label="Select Equipment"
          required
          options={assetOptions}
          value={selectedAssetId}
          onChange={(e) => {
            setSelectedAssetId(e.target.value);
            setError('');
          }}
          placeholder="-- Select Asset to Service --"
        />

        <Input
          label="Issue / Reason for Service"
          required
          placeholder="e.g. Swollen battery, broken hinge, annual calibration..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Service Provider / Facility"
            placeholder="e.g. Dell Premier, Internal IT..."
            value={serviceProvider}
            onChange={(e) => setServiceProvider(e.target.value)}
          />
          <Input
            label="Estimated / Initial Cost ($)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>

        <Input
          label="Service Dispatch Date"
          type="date"
          required
          value={maintenanceDate}
          onChange={(e) => setMaintenanceDate(e.target.value)}
        />

        <Input
          label="Diagnostic Notes"
          placeholder="Extra information regarding the defect or warranty..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Wrench}
            isLoading={isLoading}
          >
            Dispatch to Maintenance
          </Button>
        </div>
      </form>
    </Modal>
  );
};
