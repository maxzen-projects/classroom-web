const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const User = require('../models/User');
const Class = require('../models/Class');
const Fee = require('../models/Fee');

const router = express.Router();

// All routes require authentication and admin/super_admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'super_admin']));

// GET /api/students - Get all students for the school
const getStudents = async (req, res) => {
  try {
    console.log(`[STUDENTS] Getting students for school: ${req.user.school}`);

    const students = await User.find({
      role: 'student',
      school: req.user.school
    })
    .select('name email phone rollNumber parentName parentPhone class')
    .populate('class', 'name section')
    .sort({ name: 1 });

    console.log(`[STUDENTS] Found ${students.length} students`);
    res.json(students);
  } catch (error) {
    console.error(`[STUDENTS] Error getting students: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/students - Create new student
const createStudent = async (req, res) => {
  try {
    console.log(`[STUDENTS] Creating new student for school: ${req.user.school}`);

    const { name, email, phone, password, rollNumber, parentName, parentPhone, class: classId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !rollNumber || !parentName || !parentPhone) {
      return res.status(400).json({
        message: 'Name, email, password, phone, roll number, parent name, and parent phone are required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }

    // Check if roll number already exists in the school
    const existingRollNumber = await User.findOne({
      rollNumber,
      school: req.user.school
    });
    if (existingRollNumber) {
      return res.status(400).json({
        message: 'A student with this roll number already exists in the school'
      });
    }

    // If class is provided, verify it exists and belongs to the school
    if (classId) {
      const classExists = await Class.findOne({
        _id: classId,
        school: req.user.school
      });
      if (!classExists) {
        return res.status(400).json({
          message: 'Invalid class selected'
        });
      }
    }

    // Create new student
    const newStudent = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      rollNumber,
      parentName,
      parentPhone,
      class: classId || null,
      role: 'student',
      school: req.user.school
    });

    await newStudent.save();

    // Assign fees automatically if class is assigned
    if (classId) {
      const assignedClass = await Class.findById(classId);
      if (assignedClass && assignedClass.feeAmount > 0) {
        await Fee.create({
          studentId: newStudent._id,
          classId: assignedClass._id,
          schoolId: req.user.school,
          academicYear: assignedClass.academicYear,
          totalAmount: assignedClass.feeAmount,
          dueAmount: assignedClass.feeAmount,
          status: 'unpaid'
        });
        console.log(`[STUDENTS] Fee record created for student: ${newStudent._id}`);
      }
    }

    // Populate class info
    await newStudent.populate('class', 'name section');

    console.log(`[STUDENTS] Student created successfully: ${newStudent._id}`);
    res.status(201).json({
      message: 'Student created successfully',
      student: newStudent
    });
  } catch (error) {
    console.error(`[STUDENTS] Error creating student: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/students/:id - Update student
const updateStudent = async (req, res) => {
  try {
    console.log(`[STUDENTS] Updating student: ${req.params.id}`);

    const { name, email, phone, password, rollNumber, parentName, parentPhone, class: classId } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !rollNumber || !parentName || !parentPhone) {
      return res.status(400).json({
        message: 'Name, email, phone, roll number, parent name, and parent phone are required'
      });
    }

    // If class is provided, verify it exists and belongs to the school
    if (classId) {
      const classExists = await Class.findOne({
        _id: classId,
        school: req.user.school
      });
      if (!classExists) {
        return res.status(400).json({
          message: 'Invalid class selected'
        });
      }
    }

    const updateData = {
      name,
      email: email.toLowerCase(),
      phone,
      rollNumber,
      parentName,
      parentPhone,
      class: classId || null,
    };

    if (password) {
      updateData.password = password;
    }

    const updatedStudent = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student', school: req.user.school },
      updateData,
      { new: true, runValidators: true }
    ).populate('class', 'name section');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log(`[STUDENTS] Student updated successfully: ${req.params.id}`);
    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error(`[STUDENTS] Error updating student: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/students/:id - Delete student
const deleteStudent = async (req, res) => {
  try {
    console.log(`[STUDENTS] Deleting student: ${req.params.id}`);

    const deletedStudent = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'student',
      school: req.user.school
    });

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove student from class if assigned
    if (deletedStudent.class) {
      await Class.findByIdAndUpdate(
        deletedStudent.class,
        { $pull: { students: deletedStudent._id } }
      );
    }

    console.log(`[STUDENTS] Student deleted successfully: ${req.params.id}`);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(`[STUDENTS] Error deleting student: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/students/:id/assign-class - Assign student to class
const assignClass = async (req, res) => {
  try {
    console.log(`[STUDENTS] Assigning class to student: ${req.params.id}`);

    const { classId } = req.body;

    // ✅ HANDLE UNASSIGN
    if (!classId) {
      const updatedStudent = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'student', school: req.user.school },
        { class: null },
        { new: true }
      );

      return res.json({
        message: 'Class unassigned successfully',
        student: updatedStudent
      });
    }

    // Verify class exists and belongs to the school
    const classExists = await Class.findOne({
      _id: classId,
      school: req.user.school
    });

    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Update student
    const updatedStudent = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student', school: req.user.school },
      { class: classId },
      { new: true }
    ).populate('class', 'name section');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Add student to class students array
    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: updatedStudent._id } }
    );

    console.log(`[STUDENTS] Class assigned successfully to student: ${req.params.id}`);
    res.json({
      message: 'Class assigned successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.patch('/:id/assign-class', assignClass);

module.exports = router;