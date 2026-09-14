const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const AssetHistory = require('../models/AssetHistory');
const logActivity = require('../utils/logActivity');

// @desc    Assign an available asset to an employee
// @route   POST /api/assets/:id/assign
// @access  Private (Admin Only)
const assignAsset = async (req, res, next) => {
  try {
    const { employeeId, assignedDate, expectedReturnDate, notes } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an employee to assign this asset to.',
      });
    }

    // Find Asset
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset not found with id: ${req.params.id}`,
      });
    }

    // Verify Asset is currently Available
    if (asset.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Asset '${asset.name} (${asset.assetId})' cannot be assigned because its current status is '${asset.status}'. Only 'Available' assets can be assigned.`,
      });
    }

    // Find Employee
    let employee;
    if (employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(employeeId);
    } else {
      employee = await Employee.findOne({ employeeId: employeeId.toUpperCase().trim() });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'The selected employee could not be found.',
      });
    }

    if (employee.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign asset to employee '${employee.name}' because their status is '${employee.status}'.`,
      });
    }

    // Update Asset to Assigned
    asset.status = 'Assigned';
    asset.assignedTo = employee._id;
    asset.assignedDate = assignedDate ? new Date(assignedDate) : new Date();
    asset.expectedReturnDate = expectedReturnDate ? new Date(expectedReturnDate) : null;
    asset.assignmentNotes = notes || '';
    await asset.save();

    // Create Asset History Record
    await AssetHistory.create({
      asset: asset._id,
      action: 'ASSIGNED',
      employee: employee._id,
      employeeName: `${employee.name} (${employee.employeeId})`,
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'System Admin',
      date: asset.assignedDate,
      notes: notes || `Assigned to ${employee.name} in ${employee.department}`,
    });

    // Write Activity Log
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
      action: 'ASSET_ASSIGNED',
      assetId: asset._id,
      assetName: `${asset.name} (${asset.assetId})`,
      details: `Assigned to ${employee.name} (${employee.employeeId}, ${employee.department})`,
    });

    const populatedAsset = await Asset.findById(asset._id).populate(
      'assignedTo',
      'employeeId name email department designation'
    );

    return res.status(200).json({
      success: true,
      message: `Asset successfully assigned to ${employee.name}`,
      data: populatedAsset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return an assigned asset back into inventory
// @route   POST /api/assets/:id/return
// @access  Private (Admin Only)
const returnAsset = async (req, res, next) => {
  try {
    const { returnDate, condition = 'Good', notes } = req.body;

    const asset = await Asset.findById(req.params.id).populate('assignedTo');
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset not found with id: ${req.params.id}`,
      });
    }

    if (asset.status !== 'Assigned') {
      return res.status(400).json({
        success: false,
        message: `Asset is currently '${asset.status}', not 'Assigned'. Only assigned assets can be returned.`,
      });
    }

    const previousEmployee = asset.assignedTo;
    const prevEmpName = previousEmployee
      ? `${previousEmployee.name} (${previousEmployee.employeeId})`
      : 'Unknown Employee';

    // If condition is damaged or needs repair, route directly to Maintenance, else Available
    const newStatus =
      condition === 'Damaged' || condition === 'Needs Repair' ? 'Maintenance' : 'Available';

    asset.status = newStatus;
    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.expectedReturnDate = null;
    asset.assignmentNotes = '';
    await asset.save();

    // Create Asset History Record
    await AssetHistory.create({
      asset: asset._id,
      action: 'RETURNED',
      employee: previousEmployee ? previousEmployee._id : null,
      employeeName: prevEmpName,
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'System Admin',
      date: returnDate ? new Date(returnDate) : new Date(),
      condition,
      notes: notes || `Returned by ${prevEmpName} in ${condition} condition. Status changed to ${newStatus}.`,
    });

    // Write Activity Log
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
      action: 'ASSET_RETURNED',
      assetId: asset._id,
      assetName: `${asset.name} (${asset.assetId})`,
      details: `Returned from ${prevEmpName}. Condition: ${condition}. New status: ${newStatus}`,
    });

    return res.status(200).json({
      success: true,
      message: `Asset returned successfully. Status is now '${newStatus}'.`,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignAsset,
  returnAsset,
};
