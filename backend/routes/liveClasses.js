const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const mongoose = require('mongoose');
const LiveClass = require('../models/LiveClass');
const SubjectAssignment = require('../models/SubjectAssignment');
const User = require('../models/User');

// Get all live classes (for students)
const getLiveClasses = async (req, res) => {
  try {
    const liveClasses = await LiveClass.find({ scheduledAt: { $gte: new Date() } })
      .populate('teacherId', 'name')
      .sort({ scheduledAt: 1 });

    res.json(liveClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's live classes
const getTeacherLiveClasses = async (req, res) => {
  try {
    console.log('\n=== GET TEACHER LIVE CLASSES ===');
    console.log('Teacher ID:', req.user?._id);
    console.log('User object exists:', !!req.user);
    
    if (!req.user || !req.user._id) {
      console.error('req.user or req.user._id is missing!');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const liveClasses = await LiveClass.find({ teacherId: req.user._id })
      .sort({ scheduledAt: -1 });

    console.log(`Found ${liveClasses.length} live classes for teacher ${req.user._id}`);

    // Populate references safely
    const populatedClasses = await Promise.all(
      liveClasses.map(async (liveClass) => {
        try {
          await liveClass.populate('classId', 'name section');
          await liveClass.populate('subjectId', 'name');
          await liveClass.populate('chapterId', 'title');
          await liveClass.populate('teacherId', 'name');
        } catch (populateError) {
          console.warn(`Populate warning for live class ${liveClass._id}:`, populateError.message);
        }
        return liveClass;
      })
    );

    console.log('=== SUCCESSFULLY RETURNED TEACHER LIVE CLASSES ===\n');
    res.json(populatedClasses);
  } catch (error) {
    console.error('=== ERROR GETTING TEACHER LIVE CLASSES ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('=== END ERROR ===\n');
    res.status(500).json({ message: error.message, errorName: error.name });
  }
};

// Create live class (teacher only)
const createLiveClass = async (req, res) => {
  try {
    console.log('\n=== CREATE LIVE CLASS REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user?._id);
    console.log('User role:', req.user?.role);

    const { subjectId, chapterId, title, description, scheduledAt, duration, meetingUrl, platform, classId } = req.body;

    // Validate required fields
    if (!classId || !subjectId || !title || !scheduledAt || !duration) {
      console.warn('Missing required fields:', { classId, subjectId, title, scheduledAt, duration });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate IDs format
    if (
      (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) ||
      (chapterId && !mongoose.Types.ObjectId.isValid(chapterId)) ||
      (classId && !mongoose.Types.ObjectId.isValid(classId))
    ) {
      console.warn('Invalid ID format:', { subjectId, chapterId, classId });
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const assignment = await SubjectAssignment.findOne({
      teacherId: req.user._id,
      schoolId: req.user.school,
      classId,
      subjectId
    });

    if (!assignment) {
      return res.status(403).json({
        message: 'You can only schedule live classes for subjects assigned to you in the selected class'
      });
    }

    const liveClassData = {
      classId,
      subjectId,
      chapterId: chapterId || null,
      schoolId: req.user.school || null,
      teacherId: req.user._id,
      title,
      description: description || '',
      scheduledAt: new Date(scheduledAt),
      duration: parseInt(duration),
      meetingUrl: meetingUrl || null,
      platform: platform || 'zoom'
    };

    console.log('Processed live class data:', JSON.stringify(liveClassData, null, 2));

    const liveClass = new LiveClass(liveClassData);
    console.log('Created Live Class instance, attempting to save...');
    
    await liveClass.save();
    console.log('Live class saved successfully with ID:', liveClass._id);

    // Populate after saving (handle missing references gracefully)
    try {
      await liveClass.populate('classId', 'name section');
      await liveClass.populate('subjectId', 'name');
      await liveClass.populate('chapterId', 'title');
      await liveClass.populate('teacherId', 'name');
      console.log('Successfully populated references');
    } catch (populateError) {
      console.warn('Populate warning (non-fatal):', populateError.message);
    }

    console.log('=== LIVE CLASS CREATED SUCCESSFULLY ===\n');
    res.status(201).json(liveClass);
  } catch (error) {
    console.error('=== ERROR CREATING LIVE CLASS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    console.error('=== END ERROR ===\n');
    res.status(500).json({ message: error.message, errorName: error.name });
  }
};

// Update live class (teacher only)
const updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    if (liveClass.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this live class' });
    }

    Object.assign(liveClass, req.body);
    await liveClass.save();

    await liveClass.populate('classId', 'name section');
    await liveClass.populate('subjectId', 'name');
    await liveClass.populate('chapterId', 'title');
    await liveClass.populate('teacherId', 'name');

    res.json(liveClass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete live class (teacher only)
const deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    if (liveClass.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this live class' });
    }

    await liveClass.deleteOne();
    res.json({ message: 'Live class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get live classes available to the student's class and assigned subjects
const getStudentLiveClasses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select('class classId school schoolId');

    const studentClassId = student?.class || student?.classId || req.user.class || null;
    const studentSchoolId = student?.school || student?.schoolId || req.user.school || null;

    const assignments = studentClassId && studentSchoolId
      ? await SubjectAssignment.find({
          classId: studentClassId,
          schoolId: studentSchoolId
        }).select('subjectId')
      : [];

    const subjectIds = assignments
      .map((assignment) => assignment.subjectId)
      .filter(Boolean);

    if (
      subjectIds.length === 0 &&
      !studentClassId
    ) {
      return res.json([]);
    }

    const liveClasses = await LiveClass.find({
      classId: studentClassId,
      ...(subjectIds.length > 0 ? { subjectId: { $in: subjectIds } } : {})
    })
    .populate('classId', 'name section')
    .populate('subjectId', 'name')
    .populate('chapterId', 'title')
    .populate('teacherId', 'name')
    .sort({ scheduledAt: 1 });

    const response = liveClasses.map((liveClass) => {
      const plainClass = liveClass.toObject();
      plainClass.meetingLink = liveClass.meetingUrl;
      return plainClass;
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single live class by ID
const getLiveClassById = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('subjectId', 'name')
      .populate('chapterId', 'title');

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check if student is allowed to access this live class
    if (req.user.role === 'student') {
      const student = await User.findById(req.user._id).select('class classId school schoolId');
      const studentClassId = student?.class || student?.classId || req.user.class || null;
      const studentSchoolId = student?.school || student?.schoolId || req.user.school || null;
      const hasMatchingClass = Boolean(
        studentClassId &&
        liveClass.classId &&
        liveClass.classId.toString() === studentClassId.toString()
      );

      const hasMatchingAssignment = hasMatchingClass && studentSchoolId
        ? await SubjectAssignment.exists({
            classId: studentClassId,
            schoolId: studentSchoolId,
            ...(liveClass.subjectId ? { subjectId: liveClass.subjectId } : {})
          })
        : false;

      if (!hasMatchingClass || !hasMatchingAssignment) {
        return res.status(403).json({ message: 'Not authorized to view this live class' });
      }
    }

    res.json(liveClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all live classes for admin
const getAllLiveClasses = async (req, res) => {
  try {
    const liveClasses = await LiveClass.find({})
      .populate('classId', 'name section')
      .populate('subjectId', 'name')
      .populate('chapterId', 'title')
      .populate('teacherId', 'name email')
      .sort({ scheduledAt: -1 });

    res.json(liveClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update live class status (admin only)
const updateLiveClassStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    liveClass.status = status;
    await liveClass.save();

    await liveClass.populate('teacherId', 'name email');

    res.json(liveClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete live class (admin only)
const adminDeleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    await liveClass.deleteOne();
    res.json({ message: 'Live class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    const student = await User.findById(req.user._id).select('class classId school schoolId');
    const studentClassId = student?.class || student?.classId || req.user.class || null;
    const studentSchoolId = student?.school || student?.schoolId || req.user.school || null;

    const hasMatchingClass = Boolean(
      studentClassId &&
      liveClass.classId &&
      liveClass.classId.toString() === studentClassId.toString()
    );

    const hasMatchingAssignment = hasMatchingClass && studentSchoolId
      ? await SubjectAssignment.exists({
          classId: studentClassId,
          schoolId: studentSchoolId,
          ...(liveClass.subjectId ? { subjectId: liveClass.subjectId } : {})
        })
      : false;

    if (!hasMatchingClass || !hasMatchingAssignment) {
      return res.status(403).json({ message: 'Not authorized to join this live class' });
    }

    // Check if student is already joined
    const studentId = req.user._id.toString();
    const isAlreadyJoined = liveClass.attendance.some((att) => att.studentId.toString() === studentId);

    if (isAlreadyJoined) {
      return res.status(400).json({ message: 'Already joined this live class' });
    }

    // Add student to attendance
    liveClass.attendance.push({
      studentId: req.user._id,
      joinedAt: new Date(),
      status: 'joined'
    });

    await liveClass.save();
    res.json({ message: 'Successfully joined the live class' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const router = express.Router();

// Public routes
router.get('/', getLiveClasses);

// Admin routes (must come before teacher routes)
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), getAllLiveClasses);
router.put('/:id/status', authMiddleware, roleMiddleware('admin'), updateLiveClassStatus);
router.delete('/admin/:id', authMiddleware, roleMiddleware('admin'), adminDeleteLiveClass);

// Teacher routes (must come before /:id route)
router.get('/teacher/my', authMiddleware, roleMiddleware('teacher'), getTeacherLiveClasses);

// Student routes (must come before /:id route)
router.get('/student/my-classes', authMiddleware, roleMiddleware('student'), getStudentLiveClasses);

// Dynamic routes (must come after specific routes)
router.get('/:id', authMiddleware, getLiveClassById);

// Mutation routes
router.post('/:id/join', authMiddleware, roleMiddleware('student'), joinLiveClass);
router.post('/', authMiddleware, roleMiddleware('teacher'), createLiveClass);
router.put('/:id', authMiddleware, roleMiddleware('teacher'), updateLiveClass);
router.delete('/:id', authMiddleware, roleMiddleware('teacher'), deleteLiveClass);

module.exports = router;
