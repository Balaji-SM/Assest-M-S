const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const Employee = require('../models/Employee');
const logActivity = require('../utils/logActivity');

// @desc    Get all assets with search, filters, sorting & pagination
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      location,
      warrantyStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Search keyword across name, assetId, brand, model, serialNumber
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { assetId: regex },
        { brand: regex },
        { model: regex },
        { serialNumber: regex },
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by location
    if (location && location !== 'all') {
      query.location = location;
    }

    // Filter by warranty status
    const now = new Date();
    if (warrantyStatus === 'expired') {
      query.warrantyExpiry = { $lt: now };
    } else if (warrantyStatus === 'expiringSoon') {
      const thirtyDaysAhead = new Date();
      thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
      query.warrantyExpiry = { $gte: now, $lte: thirtyDaysAhead };
    } else if (warrantyStatus === 'active') {
      const thirtyDaysAhead = new Date();
      thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
      query.warrantyExpiry = { $gt: thirtyDaysAhead };
    }

    // Sorting
    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = order;

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Asset.countDocuments(query);

    const assets = await Asset.find(query)
      .populate('assignedTo', 'employeeId name email department designation')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: assets.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asset by ID with assigned employee and history
// @route   GET /api/assets/:id
// @access  Private
const getAssetById = async (req, res, next) => {
  try {
    let asset;
    // Check if ID is a valid MongoDB ObjectId or an assetId string (e.g. AST-001)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      asset = await Asset.findById(req.params.id).populate(
        'assignedTo',
        'employeeId name email phone department designation'
      );
    } else {
      asset = await Asset.findOne({
        assetId: req.params.id.toUpperCase(),
      }).populate('assignedTo', 'employeeId name email phone department designation');
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset not found with identifier: ${req.params.id}`,
      });
    }

    // Fetch complete history timeline for this asset
    const history = await AssetHistory.find({ asset: asset._id }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: asset,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Private (Admin Only)
const createAsset = async (req, res, next) => {
  try {
    const {
      assetId,
      name,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchaseCost,
      warrantyExpiry,
      status,
      location,
      description,
    } = req.body;

    // Check required fields
    if (
      !assetId ||
      !name ||
      !category ||
      !brand ||
      !model ||
      !serialNumber ||
      purchaseCost === undefined ||
      !warrantyExpiry
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: assetId, name, category, brand, model, serialNumber, purchaseCost, warrantyExpiry',
      });
    }

    // Check unique assetId
    const existingAssetId = await Asset.findOne({
      assetId: assetId.toUpperCase().trim(),
    });
    if (existingAssetId) {
      return res.status(400).json({
        success: false,
        message: `Asset ID '${assetId}' already exists. Please use a unique asset ID.`,
      });
    }

    // Check unique serial number
    const existingSerial = await Asset.findOne({
      serialNumber: serialNumber.toUpperCase().trim(),
    });
    if (existingSerial) {
      return res.status(400).json({
        success: false,
        message: `Serial Number '${serialNumber}' is already registered to another asset.`,
      });
    }

    const asset = await Asset.create({
      assetId: assetId.toUpperCase().trim(),
      name: name.trim(),
      category,
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.toUpperCase().trim(),
      purchaseDate: purchaseDate || Date.now(),
      purchaseCost: Number(purchaseCost),
      warrantyExpiry,
      status: status || 'Available',
      location: location ? location.trim() : 'Main Office',
      description: description ? description.trim() : '',
    });

    // Write initial creation history
    await AssetHistory.create({
      asset: asset._id,
      action: 'ASSET_CREATED',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'System Admin',
      date: Date.now(),
      notes: `Asset initially registered into the system with status '${asset.status}'`,
    });

    // Write audit activity log
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
      action: 'ASSET_CREATED',
      assetId: asset._id,
      assetName: `${asset.name} (${asset.assetId})`,
      details: `Registered ${asset.brand} ${asset.model} under category '${asset.category}'`,
    });

    return res.status(201).json({
      success: true,
      message: 'Asset registered successfully',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset details
// @route   PUT /api/assets/:id
// @access  Private (Admin Only)
const updateAsset = async (req, res, next) => {
  try {
    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset not found with id: ${req.params.id}`,
      });
    }

    // Check uniqueness if assetId changed
    if (req.body.assetId && req.body.assetId.toUpperCase() !== asset.assetId) {
      const duplicateId = await Asset.findOne({
        assetId: req.body.assetId.toUpperCase(),
      });
      if (duplicateId && duplicateId._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: `Asset ID '${req.body.assetId}' is already in use.`,
        });
      }
    }

    // Check uniqueness if serialNumber changed
    if (req.body.serialNumber && req.body.serialNumber.toUpperCase() !== asset.serialNumber) {
      const duplicateSerial = await Asset.findOne({
        serialNumber: req.body.serialNumber.toUpperCase(),
      });
      if (duplicateSerial && duplicateSerial._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: `Serial Number '${req.body.serialNumber}' is already in use.`,
        });
      }
    }

    const previousStatus = asset.status;

    asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'employeeId name email department designation');

    // Record history if status changed
    if (req.body.status && req.body.status !== previousStatus) {
      await AssetHistory.create({
        asset: asset._id,
        action: 'STATUS_CHANGED',
        performedBy: req.user ? req.user._id : null,
        performedByName: req.user ? req.user.name : 'System Admin',
        date: Date.now(),
        notes: `Asset status changed from '${previousStatus}' to '${asset.status}'`,
      });
    } else {
      await AssetHistory.create({
        asset: asset._id,
        action: 'ASSET_UPDATED',
        performedBy: req.user ? req.user._id : null,
        performedByName: req.user ? req.user.name : 'System Admin',
        date: Date.now(),
        notes: 'Asset specifications and details were updated',
      });
    }

    // Audit log
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
      action: 'ASSET_UPDATED',
      assetId: asset._id,
      assetName: `${asset.name} (${asset.assetId})`,
      details: `Asset details updated`,
    });

    return res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin Only)
const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset not found with id: ${req.params.id}`,
      });
    }

    // Cannot delete assigned assets
    if (asset.status === 'Assigned') {
      return res.status(400).json({
        success: false,
        message:
          'Cannot delete an asset that is currently assigned to an employee. Please return the asset first.',
      });
    }

    const assetNameInfo = `${asset.name} (${asset.assetId})`;

    await asset.deleteOne();
    await AssetHistory.deleteMany({ asset: req.params.id });

    // Audit log
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
      action: 'ASSET_DELETED',
      assetName: assetNameInfo,
      details: `Asset ${assetNameInfo} was removed from the system`,
    });

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get asset history lifecycle
// @route   GET /api/assets/:id/history
// @access  Private
const getAssetHistory = async (req, res, next) => {
  try {
    let assetId = req.params.id;
    if (!assetId.match(/^[0-9a-fA-F]{24}$/)) {
      const asset = await Asset.findOne({ assetId: req.params.id.toUpperCase() });
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Asset not found',
        });
      }
      assetId = asset._id;
    }

    const history = await AssetHistory.find({ asset: assetId })
      .populate('employee', 'name employeeId department')
      .populate('performedBy', 'name role')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetHistory,
};
