const express = require('express');
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetHistory,
} = require('../controllers/assetController');
const { assignAsset, returnAsset } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Protect all asset routes with JWT
router.use(protect);

router
  .route('/')
  .get(getAssets)
  .post(authorize('admin'), createAsset);

router
  .route('/:id')
  .get(getAssetById)
  .put(authorize('admin'), updateAsset)
  .delete(authorize('admin'), deleteAsset);

router.get('/:id/history', getAssetHistory);
router.post('/:id/assign', authorize('admin'), assignAsset);
router.post('/:id/return', authorize('admin'), returnAsset);

module.exports = router;
