import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  Eye,
  Laptop,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmployeeFormModal } from '../components/employees/EmployeeFormModal';
import { EmployeeDetailModal } from '../components/employees/EmployeeDetailModal';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Design',
  'Product',
  'Operations',
  'Marketing',
  'Human Resources',
  'Finance',
  'Sales',
  'Legal',
  'Other',
];

const STATUSES = ['All', 'Active', 'Inactive', 'On Leave', 'Terminated'];

export const EmployeesPage = () => {
  const { isAdmin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search,
        department: department !== 'All' ? department : undefined,
        status: status !== 'All' ? status : undefined,
      };

      const res = await employeeService.getEmployees(params);
      if (res.success) {
        setEmployees(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      showToast('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, department, status]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreateOrUpdateEmployee = async (formData) => {
    setActionLoading(true);
    try {
      if (editingEmployee) {
        const res = await employeeService.updateEmployee(editingEmployee._id, formData);
        if (res.success) {
          showToast(`Employee ${formData.name} updated successfully`);
          setIsFormOpen(false);
          setEditingEmployee(null);
          fetchEmployees();
        }
      } else {
        const res = await employeeService.createEmployee(formData);
        if (res.success) {
          showToast(`Employee ${formData.name} created successfully`);
          setIsFormOpen(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save employee record', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    setActionLoading(true);
    try {
      const res = await employeeService.deleteEmployee(deletingEmployee._id);
      if (res.success) {
        showToast(`Employee ${deletingEmployee.name} deleted`);
        setDeletingEmployee(null);
        fetchEmployees();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete employee', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('All');
    setStatus('All');
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '' || department !== 'All' || status !== 'All';

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
        title="Employee Directory"
        subtitle="Manage organization personnel, department assignments, and equipment custody"
        action={
          isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingEmployee(null);
                setIsFormOpen(true);
              }}
            >
              Add Employee
            </Button>
          )
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, employee ID, or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-36 text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>

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

      {/* Employees Data Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : employees.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No employees match your search
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Check for typos or enroll a new staff member into the directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Assigned Assets</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Employee ID */}
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {emp.employeeId}
                    </td>

                    {/* Full Name & Email */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {emp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {emp.email} • {emp.phone}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                        {emp.department}
                      </span>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 font-medium">{emp.designation}</td>

                    {/* Assigned Assets count badge */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedDetailId(emp._id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          emp.assignedAssetsCount > 0
                            ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/50 dark:text-brand-400 dark:border-brand-900 hover:bg-brand-100'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title="Click to view assigned hardware"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>
                          {emp.assignedAssetsCount} item{emp.assignedAssetsCount !== 1 ? 's' : ''}
                        </span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge status={emp.status} dot>
                        {emp.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedDetailId(emp._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Employee Profile & Equipment"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setDeletingEmployee(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Employee"
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
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleCreateOrUpdateEmployee}
        employee={editingEmployee}
        isLoading={actionLoading}
      />

      <EmployeeDetailModal
        isOpen={!!selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        employeeId={selectedDetailId}
      />

      <ConfirmModal
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee"
        message={`Are you sure you want to remove ${deletingEmployee?.name} (${deletingEmployee?.employeeId}) from the directory? You can only delete an employee if all their assigned assets have been returned.`}
        confirmText="Delete Employee"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default EmployeesPage;
