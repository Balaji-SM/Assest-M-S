const ActivityLog = require('../models/ActivityLog');

/**
 * Log a system activity
 * @param {Object} params
 * @param {ObjectId} [params.userId]
 * @param {string} [params.userName]
 * @param {string} params.action
 * @param {ObjectId} [params.assetId]
 * @param {string} [params.assetName]
 * @param {string} [params.details]
 */
const logActivity = async ({ userId, userName, action, assetId, assetName, details }) => {
  try {
    await ActivityLog.create({
      user: userId,
      userName: userName || 'System User',
      action,
      asset: assetId,
      assetName,
      details,
    });
  } catch (error) {
    console.error('[ActivityLog Error] Failed to write activity log:', error.message);
  }
};

module.exports = logActivity;
