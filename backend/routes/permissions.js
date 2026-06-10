const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getPermissions, updatePermissions, getAllPermissions } = require('../utils/permissionsController');

router.use(authMiddleware);

router.get(
  '/all',
  roleMiddleware(['admin', 'super_admin']),
  getAllPermissions
);

router.get(
  '/:role',
  getPermissions
);

router.put(
  '/:role',
  roleMiddleware(['admin', 'super_admin']),
  updatePermissions
);

module.exports = router;
