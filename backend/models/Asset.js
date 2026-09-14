const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Please provide an asset ID'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an asset name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide an asset category'],
      enum: [
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
      ],
      default: 'Laptop',
    },
    brand: {
      type: String,
      required: [true, 'Please provide the brand/manufacturer'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Please provide the model name/number'],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Please provide the serial number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Please specify the purchase date'],
      default: Date.now,
    },
    purchaseCost: {
      type: Number,
      required: [true, 'Please specify the purchase cost'],
      min: [0, 'Purchase cost cannot be negative'],
    },
    warrantyExpiry: {
      type: Date,
      required: [true, 'Please specify warranty expiry date'],
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'Maintenance', 'Retired'],
      default: 'Available',
    },
    location: {
      type: String,
      required: [true, 'Please specify the asset physical location'],
      trim: true,
      default: 'Main Office',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    assignedDate: {
      type: Date,
      default: null,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    assignmentNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searches and filters
assetSchema.index({
  name: 'text',
  assetId: 'text',
  brand: 'text',
  model: 'text',
  serialNumber: 'text',
});

module.exports = mongoose.model('Asset', assetSchema);
