const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Please provide an employee ID'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide the employee full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an employee email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Please provide a job designation'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for fast search
employeeSchema.index({
  name: 'text',
  email: 'text',
  employeeId: 'text',
  department: 'text',
  designation: 'text',
});

module.exports = mongoose.model('Employee', employeeSchema);
