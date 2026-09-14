import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

const DEPARTMENTS = [
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

const STATUSES = ['Active', 'Inactive', 'On Leave', 'Terminated'];

export const EmployeeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  isLoading = false,
}) => {
  const isEdit = !!employee;

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || '',
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || 'Engineering',
        designation: employee.designation || '',
        joiningDate: employee.joiningDate
          ? new Date(employee.joiningDate).toISOString().split('T')[0]
          : '',
        status: employee.status || 'Active',
      });
    } else {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        employeeId: `EMP-${randomSuffix}`,
        name: '',
        email: '',
        phone: '',
        department: 'Engineering',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Valid corporate email is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.designation.trim()) errs.designation = 'Job designation is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Employee: ${employee.name}` : 'Add New Employee'}
      subtitle={
        isEdit
          ? 'Update employee organization profile'
          : 'Enroll a new organization staff member'
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            name="employeeId"
            required
            value={formData.employeeId}
            onChange={handleChange}
            error={errors.employeeId}
            placeholder="e.g. EMP-1050"
            disabled={isEdit}
          />
          <Input
            label="Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g. Jane Smith"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="e.g. j.smith@enterprise.com"
          />
          <Input
            label="Phone Number"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="e.g. +1 (555) 019-2831"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Department"
            name="department"
            required
            options={DEPARTMENTS}
            value={formData.department}
            onChange={handleChange}
            placeholder={null}
          />
          <Input
            label="Designation / Role"
            name="designation"
            required
            value={formData.designation}
            onChange={handleChange}
            error={errors.designation}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Joining Date"
            name="joiningDate"
            type="date"
            required
            value={formData.joiningDate}
            onChange={handleChange}
          />
          <Select
            label="Employment Status"
            name="status"
            required
            options={STATUSES}
            value={formData.status}
            onChange={handleChange}
            placeholder={null}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Enroll Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
