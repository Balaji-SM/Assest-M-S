import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { employeeService } from '../../services/employeeService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Laptop,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const EmployeeDetailModal = ({ isOpen, onClose, employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && employeeId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await employeeService.getEmployeeById(employeeId);
          if (res.success) {
            setEmployee(res.data);
          }
        } catch (err) {
          console.error('Failed to load employee details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, employeeId]);

  if (!isOpen) return null;

  const assignedAssets = employee?.assignedAssets || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `${employee.name}` : 'Employee Profile'}
      subtitle={
        employee ? `${employee.designation} • ${employee.department}` : 'Loading...'
      }
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading employee profile and equipment records...
        </div>
      ) : !employee ? (
        <p className="text-xs text-rose-500 text-center py-4">Employee not found</p>
      ) : (
        <div className="space-y-6">
          {/* Header Info Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Employee ID</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {employee.employeeId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Department</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {employee.department}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Joined Date</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatDate(employee.joiningDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Status</span>
              <Badge status={employee.status} dot>
                {employee.status}
              </Badge>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.phone}</span>
            </div>
          </div>

          {/* Assigned Hardware Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Currently Assigned Hardware ({assignedAssets.length})</span>
              </h4>
            </div>

            {assignedAssets.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500">
                No corporate hardware assets are currently checked out to this employee.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {assignedAssets.map((asset) => (
                  <div
                    key={asset._id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {asset.name}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold">
                          {asset.assetId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {asset.brand} • {asset.model} • S/N: {asset.serialNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge status={asset.status}>{asset.status}</Badge>
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/assets/${asset._id}`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Asset Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
