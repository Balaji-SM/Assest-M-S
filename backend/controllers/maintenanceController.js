const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const logActivity = require('../utils/logActivity');

// @desc    Get all maintenance records with filters and pagination
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceLogs = async (req, res, next) => {
  try {
    const { status, assetId, search, page = 1, limit = 10, sort = '-maintenanceDate' } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (assetId) {
      query.asset = assetId;
    }

    if (search && search.trim() !== '') {
      query.reason = new RegExp(search.trim(), 'i');
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Maintenance.countDocuments(query);

    const logs = await Maintenance.find(query)
      .populate('asset', 'assetId name category brand model serialNumber status')
      .populate('performedBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance log
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceById = async (req, res, next) => {
  try {
    const log = await Maintenance.findById(req.params.id)
      .populate('asset')
      .populate('performedBy', 'name email');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: `Maintenance record not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule / Log asset maintenance
// @route   POST /api/maintenance
// @access  Private (Admin Only)
const createMaintenance = async (req, res, next) => {
  try {
    const { assetId, maintenanceDate, reason, cost = 0, serviceProvider, notes } = req.body;

    if (!assetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the asset and maintenance reason',
      });
    }

    // Find Asset
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'The specified asset could not be found',
      });
    }

    // Update asset status to Maintenance
    const previousStatus = asset.status;
    asset.status = 'Maintenance';
    // If it was assigned to an employee, release assignment so it is not in possession during repair
    if (asset.assignedTo) {
      asset.assignedTo = null;
      asset.assignedDate = null;
      asset.expectedReturnDate = null;
      asset.assignmentNotes = '';
    }
    await asset.save();

    // Create Maintenance entry
    const maintenance = await Maintenance.create({
      asset: asset._id,
      maintenanceDate: maintenanceDate ? new Date(maintenanceDate) : new Date(),
      reason: reason.trim(),
      cost: Number(cost) || 0,
      serviceProvider: serviceProvider ? serviceProvider.trim() : 'Internal IT Support',
      notes: notes ? notes.trim() : '',
      status: 'In Progress',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'System Admin',
    });

    // Log in Asset History
    await AssetHistory.create({
      asset: asset._id,
      action: 'MAINTENANCE_STARTED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'System Admin',
      date: maintenance.maintenanceDate,
      notes: `Sent for maintenance. Reason: ${reason}. Provider: ${maintenance.serviceProvider}. (Prev status: ${previousStatus})`,
    });

    // Audit Log
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
      action: 'MAINTENANCE_STARTED',
      assetId: asset._id,
      assetName: `${asset.name} (${asset.assetId})`,
      details: `Reason: ${reason}. Estimated/Initial cost: $${cost}`,
    });

    const populated = await Maintenance.findById(maintenance._id).populate(
      'asset',
      'assetId name category brand model status'
    );

    return res.status(201).json({
      success: true,
      message: 'Asset marked for maintenance successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance log / Mark as completed
// @route   PUT /api/maintenance/:id
// @access  Private (Admin Only)
const updateMaintenance = async (req, res, next) => {
  try {
    let log = await Maintenance.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: `Maintenance record not found with id: ${req.params.id}`,
      });
    }

    const { status, cost, notes, serviceProvider, completedDate } = req.body;
    const wasInProgress = log.status === 'In Progress';

    if (cost !== undefined) log.cost = Number(cost);
    if (notes !== undefined) log.notes = notes;
    if (serviceProvider !== undefined) log.serviceProvider = serviceProvider;

    // Handle status change
    if (status && status !== log.status) {
      log.status = status;

      const asset = await Asset.findById(log.asset);

      if (status === 'Completed') {
        log.completedDate = completedDate ? new Date(completedDate) : new Date();

        if (asset) {
          asset.status = 'Available';
          await asset.save();

          await AssetHistory.create({
            asset: asset._id,
            action: 'MAINTENANCE_COMPLETED',
            performedBy: req.user ? req.user._id : null,
            performedByName: req.user ? req.user.name : 'System Admin',
            date: log.completedDate,
            notes: `Maintenance completed. Total Cost: $${log.cost}. Notes: ${log.notes || 'Repairs verified'}. Status reverted to Available.`,
          });
        }

        await logActivity({
          userId: req.user ? req.user._id : null,
          userName: req.user ? req.user.name : 'System Admin',
          action: 'MAINTENANCE_COMPLETED',
          assetId: asset ? asset._id : null,
          assetName: asset ? `${asset.name} (${asset.assetId})` : 'Asset',
          details: `Maintenance completed. Cost: $${log.cost}`,
        });
      } else if (status === 'Cancelled' && wasInProgress) {
        if (asset) {
          asset.status = 'Available';
          await asset.save();
        }
      }
    }

    await log.save();

    const updatedLog = await Maintenance.findById(log._id)
      .populate('asset', 'assetId name category brand model status')
      .populate('performedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updatedLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a maintenance log
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin Only)
const deleteMaintenance = async (req, res, next) => {
  try {
    const log = await Maintenance.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: `Maintenance record not found with id: ${req.params.id}`,
      });
    }

    // If deleting an ongoing maintenance record, restore asset status to Available
    if (log.status === 'In Progress') {
      const asset = await Asset.findById(log.asset);
      if (asset && asset.status === 'Maintenance') {
        asset.status = 'Available';
        await asset.save();
      }
    }

    await log.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Maintenance record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceLogs,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};
