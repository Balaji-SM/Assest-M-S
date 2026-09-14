const ActivityLog = require('../models/ActivityLog');

// @desc    Get paginated activity audit logs
// @route   GET /api/activities
// @access  Private
const getActivityLogs = async (req, res, next) => {
  try {
    const { action, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (action && action !== 'all') {
      query.action = action;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { userName: regex },
        { action: regex },
        { assetName: regex },
        { details: regex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await ActivityLog.countDocuments(query);

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .populate('asset', 'assetId name category')
      .sort({ createdAt: -1 })
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

module.exports = {
  getActivityLogs,
};
