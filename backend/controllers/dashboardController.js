const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const Maintenance = require('../models/Maintenance');
const ActivityLog = require('../models/ActivityLog');
const AssetHistory = require('../models/AssetHistory');

// @desc    Get aggregated dashboard KPIs, chart data, and warranty alerts
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    // 1. KPI Counts
    const [
      totalAssets,
      availableAssets,
      assignedAssets,
      maintenanceAssets,
      retiredAssets,
      totalEmployees,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'Available' }),
      Asset.countDocuments({ status: 'Assigned' }),
      Asset.countDocuments({ status: 'Maintenance' }),
      Asset.countDocuments({ status: 'Retired' }),
      Employee.countDocuments({ status: 'Active' }),
    ]);

    // Financial calculations
    const assetCostAgg = await Asset.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$purchaseCost' } } },
    ]);
    const totalAssetValue = assetCostAgg.length > 0 ? assetCostAgg[0].totalValue : 0;

    const maintenanceCostAgg = await Maintenance.aggregate([
      { $group: { _id: null, totalCost: { $sum: '$cost' } } },
    ]);
    const totalMaintenanceCost =
      maintenanceCostAgg.length > 0 ? maintenanceCostAgg[0].totalCost : 0;

    // 2. Chart: Assets by Status
    const statusAgg = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const assetsByStatus = ['Available', 'Assigned', 'Maintenance', 'Retired'].map((st) => {
      const match = statusAgg.find((item) => item._id === st);
      return {
        status: st,
        count: match ? match.count : 0,
      };
    });

    // 3. Chart: Assets by Category
    const categoryAgg = await Asset.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const assetsByCategory = categoryAgg.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    // 4. Chart: Monthly Assignments (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAssignmentAgg = await AssetHistory.aggregate([
      {
        $match: {
          action: 'ASSIGNED',
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format last 6 months labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAssignments = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = `${monthNames[d.getMonth()]} ${year}`;

      const found = monthlyAssignmentAgg.find(
        (m) => m._id.year === year && m._id.month === month
      );
      monthlyAssignments.push({
        month: label,
        assignments: found ? found.count : 0,
      });
    }

    // 5. Warranty Expiring Soon (Within 30 Days)
    const expiringSoonAssets = await Asset.find({
      warrantyExpiry: { $gte: now, $lte: thirtyDaysAhead },
    })
      .select('assetId name brand model warrantyExpiry status category location')
      .sort({ warrantyExpiry: 1 })
      .limit(10);

    const warrantyAlerts = expiringSoonAssets.map((asset) => {
      const diffTime = Math.abs(new Date(asset.warrantyExpiry) - now);
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...asset.toObject(),
        daysRemaining,
      };
    });

    // 6. Recently Added Assets
    const recentAssets = await Asset.find()
      .select('assetId name category status brand model createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalAssets,
          availableAssets,
          assignedAssets,
          maintenanceAssets,
          retiredAssets,
          totalEmployees,
          totalAssetValue,
          totalMaintenanceCost,
        },
        charts: {
          assetsByStatus,
          assetsByCategory,
          monthlyAssignments,
        },
        warrantyAlerts,
        recentAssets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activities stream for dashboard
// @route   GET /api/dashboard/activities
// @access  Private
const getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
};
