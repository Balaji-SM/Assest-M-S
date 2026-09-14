import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { RotateCcw, AlertTriangle } from 'lucide-react';

const CONDITIONS = ['Good', 'Fair', 'Damaged', 'Needs Repair'];

export const ReturnModal = ({ isOpen, onClose, onReturn, asset, isLoading = false }) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReturnDate(new Date().toISOString().split('T')[0]);
      setCondition('Good');
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onReturn({
      returnDate,
      condition,
      notes,
    });
  };

  const isDamaged = condition === 'Damaged' || condition === 'Needs Repair';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Return Asset to Inventory"
      subtitle={`Processing check-in for ${asset?.name} (${asset?.assetId})`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {asset?.assignedTo && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold block text-slate-900 dark:text-slate-100">
              Current Custodian:
            </span>
            <span>
              {asset.assignedTo.name} ({asset.assignedTo.department})
            </span>
          </div>
        )}

        <Input
          label="Return Date"
          type="date"
          required
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
        />

        <Select
          label="Return Condition"
          required
          options={CONDITIONS}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder={null}
        />

        {isDamaged && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Marking condition as <strong>{condition}</strong> will automatically route this asset
              to <strong>Maintenance</strong> status instead of Available.
            </span>
          </div>
        )}

        <Input
          label="Return Inspection Notes"
          placeholder="e.g. Returned with original power adapter, minimal wear..."
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
            icon={RotateCcw}
            isLoading={isLoading}
          >
            Confirm Return
          </Button>
        </div>
      </form>
    </Modal>
  );
};
