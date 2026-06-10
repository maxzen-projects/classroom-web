const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const School = require('../models/School');
// Get all students
const getStudents = async (req, res) => {
  try {
    console.log(`[ADMIN] Getting students - Page: ${req.query.page}, Search: ${req.query.search}, Status: ${req.query.status}`);
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

    let query = { role: 'student' };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const students = await User.find(query)
      .select('name email phone role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    console.log(`[ADMIN] Found ${total} students matching criteria`);

    const studentsWithCount = students.map(student => student.toObject());

    console.log(`[ADMIN] Returning ${studentsWithCount.length} students for page ${page}`);
    res.json({
      students: studentsWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(`[ADMIN] Error getting students: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers
const getTeachers = async (req, res) => {
  try {
    console.log(`[ADMIN] Getting teachers - Page: ${req.query.page}, Search: ${req.query.search}, Status: ${req.query.status}`);
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

    let query = { role: 'teacher' };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const teachers = await User.find(query)
      .select('name email phone role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    console.log(`[ADMIN] Found ${total} teachers matching criteria`);

    const teachersWithCount = teachers.map(teacher => teacher.toObject());

    console.log(`[ADMIN] Returning ${teachersWithCount.length} teachers for page ${page}`);
    res.json({
      teachers: teachersWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(`[ADMIN] Error getting teachers: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    console.log(`[ADMIN] Blocking user: ${req.params.id}`);
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log(`[ADMIN] User not found: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    console.log(`[ADMIN] User blocked successfully: ${req.params.id}`);
    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    console.error(`[ADMIN] Error blocking user ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    console.log(`[ADMIN] Unblocking user: ${req.params.id}`);
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log(`[ADMIN] User not found: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    console.log(`[ADMIN] User unblocked successfully: ${req.params.id}`);
    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    console.error(`[ADMIN] Error unblocking user ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    console.log(`[ADMIN] Deleting user: ${req.params.id}`);
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log(`[ADMIN] User not found: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    console.log(`[ADMIN] User deleted successfully: ${req.params.id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`[ADMIN] Error deleting user ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Get user details
const getUserDetails = async (req, res) => {
  try {
    console.log(`[ADMIN] Getting user details: ${req.params.id}`);
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log(`[ADMIN] User not found: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`[ADMIN] User details retrieved: ${req.params.id}`);
    res.json(user);
  } catch (error) {
    console.error(`[ADMIN] Error getting user details ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    console.log(`[ADMIN] Getting dashboard data for school: ${req.user.school}`);

 

       // ✅ ADD THIS
    const user = await User.findById(req.user._id).populate('school', 'name');

    const schoolId = user.school?._id;

    const schoolName = user?.school?.name || 'School';

    // 1. Total Classes
    const totalClasses = await Class.countDocuments({ school: schoolId });

    // 2. Total Students
    const totalStudents = await User.countDocuments({
      role: 'student',
      school: schoolId
    });

    // 3. Total Teachers
    const totalTeachers = await User.countDocuments({
      role: 'teacher',
      school: schoolId
    });

    // 4. Attendance Percentage
    const attendanceStats = await Attendance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $match: {
          'studentInfo.school': schoolId
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalRecords = attendanceStats.length > 0 ? attendanceStats[0].totalRecords : 0;
    const presentRecords = attendanceStats.length > 0 ? attendanceStats[0].presentRecords : 0;
    const attendancePercentage = totalRecords === 0 ? 0 : ((presentRecords / totalRecords) * 100).toFixed(2);

    // 5. Fee Collection Percentage
    const feeStats = await Fee.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $match: {
          'studentInfo.school': schoolId
        }
      },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$amount' },
          paidFees: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const totalFees = feeStats.length > 0 ? feeStats[0].totalFees : 0;
    const paidFees = feeStats.length > 0 ? feeStats[0].paidFees : 0;
    const feeCollectionPercentage = totalFees === 0 ? 0 : ((paidFees / totalFees) * 100).toFixed(2);

    console.log(`[ADMIN] Dashboard data calculated: Classes: ${totalClasses}, Students: ${totalStudents}, Teachers: ${totalTeachers}, Attendance: ${attendancePercentage}%, Fees: ${feeCollectionPercentage}%`);

    res.json({
       schoolName: user.school?.name || 'Admin Dashboard',
      totalClasses,
      totalStudents,
      totalTeachers,
      attendancePercentage: parseFloat(attendancePercentage),
      feeCollectionPercentage: parseFloat(feeCollectionPercentage)
    });
  } catch (error) {
    console.error(`[ADMIN] Error getting dashboard data: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const router = express.Router();

// All admin routes require authentication
router.use(authMiddleware);

// Dashboard route - accessible by admin and super_admin
router.get('/dashboard', roleMiddleware(['admin', 'super_admin']), getAdminDashboard);

// Other routes require admin role
router.use(roleMiddleware('admin'));
router.get('/students', getStudents);
router.get('/teachers', getTeachers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
