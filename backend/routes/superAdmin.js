const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const School = require('../models/School');
const User = require('../models/User');

const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalSchools = await School.countDocuments();
    const activeSchools = await School.countDocuments({ status: 'active' });
    const inactiveSchools = await School.countDocuments({ status: 'inactive' });

    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      totalSchools,
      activeSchools,
      inactiveSchools,
      totalAdmins,
      totalTeachers,
      totalStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
