import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CheckCircle2, DollarSign } from 'lucide-react';

export const CompleteMaintenanceModal = ({
  isOpen,
  onClose,
  onComplete,
  log,
  isLoading = false,
}) => {
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [completedDate, setCompletedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (log) {
      setCost(log.cost !== undefined ? log.cost : '0');
      setNotes(log.notes || '');
      setCompletedDate(new Date().toISOString().split('T')[0]);
    }
  }, [log]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      status: 'Completed',
      cost: cost ? Number(cost) : 0,
      notes,
      completedDate,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Maintenance Ticket"
      subtitle={`Finalizing repair for ${log?.asset?.name} (${log?.asset?.assetId})`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Completing this maintenance ticket reverts the asset status to <strong>Available</strong>,
            making it ready for employee deployment.
          </span>
        </div>

        <Input
          label="Final Service Cost ($)"
          type="number"
          min="0"
          step="0.01"
          required
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />

        <Input
          label="Completion Date"
          type="date"
          required
          value={completedDate}
          onChange={(e) => setCompletedDate(e.target.value)}
        />

        <Input
          label="Resolution / Repair Notes"
          placeholder="e.g. Battery swapped under AppleCare, diagnostics passed 100%..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            icon={CheckCircle2}
            isLoading={isLoading}
          >
            Mark as Completed
          </Button>
        </div>
      </form>
    </Modal>
  );
};
