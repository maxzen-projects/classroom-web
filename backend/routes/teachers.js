const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const User = require('../models/User');
const Class = require('../models/Class');

const router = express.Router();

// All routes require authentication and admin/super_admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'super_admin']));

// GET /api/teachers - Get all teachers for the school
// const getTeachers = async (req, res) => {
//   try {
//     console.log(`[TEACHERS] Getting teachers for school: ${req.user.school}`);

//     const teachers = await User.find({
//       role: 'teacher',
//       school: req.user.school
//     })
//     .select('name email phone subjectsTeaching assignedClasses')
//     .populate('assignedClasses', 'name section')
//     .sort({ name: 1 });

//     console.log(`[TEACHERS] Found ${teachers.length} teachers`);
//     res.json(teachers);
//   } catch (error) {
//     console.error(`[TEACHERS] Error getting teachers: ${error.message}`);
//     res.status(500).json({ message: error.message });
//   }
// };
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher',
      school: req.user.school
    })
    .select('name email phone subjectsTeaching')
    .sort({ name: 1 });

    const teachersWithClasses = await Promise.all(
      teachers.map(async (teacher) => {
        const classes = await Class.find({
          classTeacher: teacher._id
        }).select('name section');

        return {
          ...teacher.toObject(),
          assignedClasses: classes
        };
      })
    );

    res.json(teachersWithClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST /api/teachers - Create new teacher
const createTeacher = async (req, res) => {
  try {
    console.log(`[TEACHERS] Creating new teacher for school: ${req.user.school}`);

    const { name, email, phone, password, subjectsTeaching } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !subjectsTeaching || !Array.isArray(subjectsTeaching) || subjectsTeaching.length === 0) {
      return res.status(400).json({
        message: 'Name, email, phone, password, and subjects are required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }

    // Create new teacher
    const newTeacher = new User({
      name,
      email,
      phone,
      subjectsTeaching: subjectsTeaching,
      assignedClasses: [],
      role: 'teacher',
      password, // Admin provides password
      school: req.user.school
    });

    await newTeacher.save();

    // Populate assigned classes (empty array)
    await newTeacher.populate('assignedClasses', 'name section');

    console.log(`[TEACHERS] Teacher created successfully: ${newTeacher._id}`);
    res.status(201).json({
      message: 'Teacher created successfully. Please share the login credentials with the teacher.',
      teacher: newTeacher
    });
  } catch (error) {
    console.error(`[TEACHERS] Error creating teacher: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/teachers/:id - Update teacher
const updateTeacher = async (req, res) => {
  try {
    console.log(`[TEACHERS] Updating teacher: ${req.params.id}`);

    const { name, email, phone, subjectsTeaching } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subjectsTeaching || !Array.isArray(subjectsTeaching) || subjectsTeaching.length === 0) {
      return res.status(400).json({
        message: 'Name, email, phone, and subjects are required'
      });
    }

    const updatedTeacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'teacher', school: req.user.school },
      { name, email, phone, subjectsTeaching: subjectsTeaching },
      { new: true, runValidators: true }
    ).populate('assignedClasses', 'name section');

    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log(`[TEACHERS] Teacher updated successfully: ${req.params.id}`);
    res.json({
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    console.error(`[TEACHERS] Error updating teacher: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/teachers/:id - Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    console.log(`[TEACHERS] Deleting teacher: ${req.params.id}`);

    const deletedTeacher = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'teacher',
      school: req.user.school
    });

    if (!deletedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Remove teacher from assigned classes
    if (deletedTeacher.assignedClasses && deletedTeacher.assignedClasses.length > 0) {
      await Class.updateMany(
        { _id: { $in: deletedTeacher.assignedClasses } },
        { $unset: { classTeacher: null } }
      );
    }

    console.log(`[TEACHERS] Teacher deleted successfully: ${req.params.id}`);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error(`[TEACHERS] Error deleting teacher: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/teachers/:id/assign-classes - Assign classes to teacher
const assignClasses = async (req, res) => {
  try {
    console.log(`[TEACHERS] Assigning classes to teacher: ${req.params.id}`);

    const { classIds } = req.body;

    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: 'Class IDs array is required' });
    }

    // Verify all classes exist and belong to the school
    const classesExist = await Class.find({
      _id: { $in: classIds },
      school: req.user.school
    });

    if (classesExist.length !== classIds.length) {
      return res.status(400).json({ message: 'One or more invalid classes selected' });
    }

    // Update teacher
    const updatedTeacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'teacher', school: req.user.school },
      { assignedClasses: classIds },
      { new: true }
    ).populate('assignedClasses', 'name section');

    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update class teachers - first remove from old classes
    await Class.updateMany(
      { classTeacher: req.params.id, school: req.user.school },
      { $unset: { classTeacher: null } }
    );

    // Then assign to new classes
    await Class.updateMany(
      { _id: { $in: classIds }, school: req.user.school },
      { classTeacher: req.params.id }
    );

    console.log(`[TEACHERS] Classes assigned successfully to teacher: ${req.params.id}`);
    res.json({
      message: 'Classes assigned successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    console.error(`[TEACHERS] Error assigning classes: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getTeachers);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);
router.patch('/:id/assign-classes', assignClasses);

module.exports = router;