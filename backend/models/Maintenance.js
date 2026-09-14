const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required for maintenance'],
    },
    maintenanceDate: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      required: [true, 'Please provide the maintenance reason'],
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    serviceProvider: {
      type: String,
      default: 'Internal IT Support',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Cancelled'],
      default: 'In Progress',
    },
    completedDate: {
      type: Date,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

maintenanceSchema.index({ asset: 1, status: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
