const mongoose = require('mongoose');

const assetHistorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required for history record'],
    },
    action: {
      type: String,
      required: [true, 'History action type is required'],
      enum: [
        'ASSET_CREATED',
        'ASSET_UPDATED',
        'ASSIGNED',
        'RETURNED',
        'MAINTENANCE_STARTED',
        'MAINTENANCE_COMPLETED',
        'STATUS_CHANGED',
        'ASSET_RETIRED',
        'ASSET_DELETED',
      ],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    employeeName: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performedByName: {
      type: String,
      default: 'System Admin',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    condition: {
      type: String,
      default: 'Good',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

assetHistorySchema.index({ asset: 1, date: -1 });

module.exports = mongoose.model('AssetHistory', assetHistorySchema);
