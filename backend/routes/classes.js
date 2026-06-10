const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const Class = require('../models/Class');
const User = require('../models/User');
const FeeStructure = require('../models/FeeStructure');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/classes/student/my-class - Get student's assigned class
router.get('/student/my-class', roleMiddleware(['student']), async (req, res) => {
  try {
    console.log(`[CLASSES] Getting class for student: ${req.user._id}`);

    const student = await User.findById(req.user._id).populate('class');
    if (!student.class) {
      return res.status(404).json({ message: 'Student is not assigned to any class' });
    }

    res.json(student.class);
  } catch (error) {
    console.error(`[CLASSES] Error getting student class: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Apply admin role middleware to remaining routes
router.use(roleMiddleware(['admin', 'super_admin']));

// GET /api/classes - Get all classes for the school
const getClasses = async (req, res) => {
  try {
    console.log(`[CLASSES] Getting classes for school: ${req.user.school}`);

    const classes = await Class.find({ school: req.user.school })
      .populate('classTeacher', 'name email')
      .sort({ name: 1, section: 1 });

    // Add student count to each class
    const classesWithCount = classes.map(cls => ({
      ...cls.toObject(),
      studentCount: cls.students.length
    }));

    console.log(`[CLASSES] Found ${classesWithCount.length} classes`);
    res.json(classesWithCount);
  } catch (error) {
    console.error(`[CLASSES] Error getting classes: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/classes - Create new class
const createClass = async (req, res) => {
  try {
    console.log(`[CLASSES] Creating new class for school: ${req.user.school}`);

    const { name, section, academicYear, classTeacher, feeAmount } = req.body;

    // Validate required fields
    if (!name || !section || !academicYear || feeAmount === undefined) {
      return res.status(400).json({
        message: 'Name, section, academic year, and fee amount are required'
      });
    }

    // Check if class already exists
    const existingClass = await Class.findOne({
      name,
      section,
      academicYear,
      school: req.user.school
    });

    if (existingClass) {
      return res.status(400).json({
        message: 'A class with this name, section, and academic year already exists'
      });
    }

    // Create new class
    const newClass = new Class({
      name,
      section,
      academicYear,
      classTeacher,
      feeAmount,
      school: req.user.school,
      students: []
    });

    await newClass.save();

    // Auto-create fee structure for the new class
    const feeStructure = new FeeStructure({
      schoolId: req.user.school,
      classId: newClass._id,
      feeType: 'tuition',
      name: `${name} - ${section} Tuition Fee`,
      amount: feeAmount,
      frequency: 'monthly',
      dueDay: 15,
      lateFeeAmount: 0,
      lateFeePercentage: 0,
      isActive: true,
      appliesTo: 'all_students',
      createdBy: req.user._id
    });

    await feeStructure.save();

    // Populate teacher info
    await newClass.populate('classTeacher', 'name email');

    console.log(`[CLASSES] Class created successfully: ${newClass._id}, Fee structure created: ${feeStructure._id}`);
    res.status(201).json({
      message: 'Class created successfully',
      class: {
        ...newClass.toObject(),
        studentCount: 0
      },
      feeStructure
    });
  } catch (error) {
    console.error(`[CLASSES] Error creating class: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A class with this name, section, and academic year already exists'
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/classes/:id - Update class
const updateClass = async (req, res) => {
  try {
    console.log(`[CLASSES] Updating class: ${req.params.id}`);

    const { name, section, academicYear, classTeacher } = req.body;

    // Validate required fields
    if (!name || !section || !academicYear) {
      return res.status(400).json({
        message: 'Name, section, and academic year are required'
      });
    }

    const updatedClass = await Class.findOneAndUpdate(
      { _id: req.params.id, school: req.user.school },
      { name, section, academicYear, classTeacher },
      { new: true, runValidators: true }
    ).populate('classTeacher', 'name email');

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Add student count
    const classWithCount = {
      ...updatedClass.toObject(),
      studentCount: updatedClass.students.length
    };

    console.log(`[CLASSES] Class updated successfully: ${req.params.id}`);
    res.json({
      message: 'Class updated successfully',
      class: classWithCount
    });
  } catch (error) {
    console.error(`[CLASSES] Error updating class: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A class with this name, section, and academic year already exists'
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/classes/:id - Delete class
const deleteClass = async (req, res) => {
  try {
    console.log(`[CLASSES] Deleting class: ${req.params.id}`);

    const deletedClass = await Class.findOneAndDelete({
      _id: req.params.id,
      school: req.user.school
    });

    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    console.log(`[CLASSES] Class deleted successfully: ${req.params.id}`);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error(`[CLASSES] Error deleting class: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/classes/:id/assign-teacher - Assign teacher to class
const assignTeacher = async (req, res) => {
  try {
    console.log(`[CLASSES] Assigning teacher to class: ${req.params.id}`);

    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    // Verify teacher exists and is a teacher
    const teacher = await User.findOne({
      _id: teacherId,
      role: 'teacher',
      school: req.user.school
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const updatedClass = await Class.findOneAndUpdate(
      { _id: req.params.id, school: req.user.school },
      { classTeacher: teacherId },
      { new: true }
    ).populate('classTeacher', 'name email');

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Add student count
    const classWithCount = {
      ...updatedClass.toObject(),
      studentCount: updatedClass.students.length
    };

    console.log(`[CLASSES] Teacher assigned successfully to class: ${req.params.id}`);
    res.json({
      message: 'Teacher assigned successfully',
      class: classWithCount
    });
  } catch (error) {
    console.error(`[CLASSES] Error assigning teacher: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getClasses);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
router.patch('/:id/assign-teacher', assignTeacher);

module.exports = router;