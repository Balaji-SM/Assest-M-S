import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

const CATEGORIES = [
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

const STATUSES = ['Available', 'Assigned', 'Maintenance', 'Retired'];

export const AssetFormModal = ({ isOpen, onClose, onSubmit, asset = null, isLoading = false }) => {
  const isEdit = !!asset;

  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    category: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '',
    warrantyExpiry: '',
    status: 'Available',
    location: 'Main Office',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (asset) {
      setFormData({
        assetId: asset.assetId || '',
        name: asset.name || '',
        category: asset.category || 'Laptop',
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate
          ? new Date(asset.purchaseDate).toISOString().split('T')[0]
          : '',
        purchaseCost: asset.purchaseCost !== undefined ? asset.purchaseCost : '',
        warrantyExpiry: asset.warrantyExpiry
          ? new Date(asset.warrantyExpiry).toISOString().split('T')[0]
          : '',
        status: asset.status || 'Available',
        location: asset.location || 'Main Office',
        description: asset.description || '',
      });
    } else {
      // Auto-generate a clean asset ID like AST-xxxx for new assets
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        assetId: `AST-${randomSuffix}`,
        name: '',
        category: 'Laptop',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: '',
        warrantyExpiry: '',
        status: 'Available',
        location: 'Main Office',
        description: '',
      });
    }
    setErrors({});
  }, [asset, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.assetId.trim()) errs.assetId = 'Asset ID is required';
    if (!formData.name.trim()) errs.name = 'Asset Name is required';
    if (!formData.brand.trim()) errs.brand = 'Brand is required';
    if (!formData.model.trim()) errs.model = 'Model is required';
    if (!formData.serialNumber.trim()) errs.serialNumber = 'Serial Number is required';
    if (formData.purchaseCost === '' || isNaN(formData.purchaseCost)) {
      errs.purchaseCost = 'Valid purchase cost is required';
    }
    if (!formData.warrantyExpiry) errs.warrantyExpiry = 'Warranty expiry date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      purchaseCost: Number(formData.purchaseCost),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Asset: ${asset.assetId}` : 'Register New Enterprise Asset'}
      subtitle={
        isEdit
          ? 'Update hardware specifications or location'
          : 'Add new hardware or equipment to the inventory system'
      }
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Asset ID"
            name="assetId"
            required
            value={formData.assetId}
            onChange={handleChange}
            error={errors.assetId}
            placeholder="e.g. AST-1050"
            disabled={isEdit}
          />
          <Input
            label="Asset Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g. MacBook Pro 16 M3"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Category"
            name="category"
            required
            options={CATEGORIES}
            value={formData.category}
            onChange={handleChange}
            placeholder={null}
          />
          <Input
            label="Brand / Manufacturer"
            name="brand"
            required
            value={formData.brand}
            onChange={handleChange}
            error={errors.brand}
            placeholder="e.g. Apple, Dell, HP"
          />
          <Input
            label="Model Number / Spec"
            name="model"
            required
            value={formData.model}
            onChange={handleChange}
            error={errors.model}
            placeholder="e.g. Precision 7680"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Serial Number"
            name="serialNumber"
            required
            value={formData.serialNumber}
            onChange={handleChange}
            error={errors.serialNumber}
            placeholder="e.g. SN-8921820"
          />
          <Input
            label="Location / Storage"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. HQ Floor 4 or IT Room A"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Purchase Cost ($)"
            name="purchaseCost"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.purchaseCost}
            onChange={handleChange}
            error={errors.purchaseCost}
            placeholder="e.g. 1999.00"
          />
          <Input
            label="Purchase Date"
            name="purchaseDate"
            type="date"
            required
            value={formData.purchaseDate}
            onChange={handleChange}
          />
          <Input
            label="Warranty Expiry Date"
            name="warrantyExpiry"
            type="date"
            required
            value={formData.warrantyExpiry}
            onChange={handleChange}
            error={errors.warrantyExpiry}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Inventory Status"
            name="status"
            required
            options={STATUSES}
            value={formData.status}
            onChange={handleChange}
            placeholder={null}
            disabled={formData.status === 'Assigned' && isEdit}
            helperText={
              formData.status === 'Assigned'
                ? 'To change status, please use the Return Asset workflow.'
                : ''
            }
          />
          <Input
            label="Notes / Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Any hardware configuration details..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Register Asset'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
