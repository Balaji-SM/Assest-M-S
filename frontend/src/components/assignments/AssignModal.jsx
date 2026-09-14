import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { employeeService } from '../../services/employeeService';
import { UserCheck, Calendar, Info } from 'lucide-react';

export const AssignModal = ({ isOpen, onClose, onAssign, asset, isLoading = false }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchEmployees = async () => {
        try {
          const res = await employeeService.getEmployees({ status: 'Active', limit: 100 });
          if (res.success) {
            setEmployees(res.data);
          }
        } catch (err) {
          console.error('Failed to load active employees:', err);
        }
      };
      fetchEmployees();
      setSelectedEmployeeId('');
      setAssignedDate(new Date().toISOString().split('T')[0]);
      setExpectedReturnDate('');
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an active employee to assign this asset.');
      return;
    }

    onAssign({
      employeeId: selectedEmployeeId,
      assignedDate,
      expectedReturnDate: expectedReturnDate || null,
      notes,
    });
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} (${emp.employeeId} - ${emp.department})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Asset to Employee"
      subtitle={`Deploying ${asset?.name} (${asset?.assetId})`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-800 dark:text-indigo-300 space-y-0.5">
            <p className="font-semibold">Assignment Workflow</p>
            <p>
              Assigning this hardware changes its status from <strong>Available</strong> to{' '}
              <strong>Assigned</strong> and automatically logs an immutable audit trail entry.
            </p>
          </div>
        </div>

        {error && (
          <p className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </p>
        )}

        <Select
          label="Select Employee"
          required
          options={employeeOptions}
          value={selectedEmployeeId}
          onChange={(e) => {
            setSelectedEmployeeId(e.target.value);
            setError('');
          }}
          placeholder="-- Select an Active Employee --"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Assignment Date"
            type="date"
            required
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
          />
          <Input
            label="Expected Return Date"
            type="date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
            helperText="Optional"
          />
        </div>

        <Input
          label="Assignment Notes / Purpose"
          placeholder="e.g. Assigned for Q3 Mobile Client project..."
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
            icon={UserCheck}
            isLoading={isLoading}
          >
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
