const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const SubjectAssignment = require('../models/SubjectAssignment');
const Class = require('../models/Class');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 🔹 GET /api/subject-assignments/student/my-subjects - Get subjects for student's class
// ✅ Fetches all subjects assigned to the student's class
router.get('/student/my-subjects', roleMiddleware(['student']), async (req, res) => {
  try {
    // Get student's class
    const student = await User.findById(req.user._id).populate('class');
    if (!student.class) {
      return res.status(400).json({ message: 'Student is not assigned to any class' });
    }

    // Get all subjects for the student's class
    const subjects = await SubjectAssignment.find({
      classId: student.class._id,
      schoolId: req.user.school
    })
    .populate('subjectId', 'name')
    .populate('teacherId', 'name email profileImage')
    .sort({ subjectId: 1 });

    const subjectIds = subjects.map((assignment) => assignment.subjectId._id);
    const chapters = await Chapter.find({ subjectId: { $in: subjectIds }, isActive: true }).select('_id subjectId');
    const chapterIdToSubjectId = chapters.reduce((map, chapter) => {
      map[chapter._id.toString()] = chapter.subjectId.toString();
      return map;
    }, {});

    const chaptersBySubject = chapters.reduce((map, chapter) => {
      const sid = chapter.subjectId.toString();
      map[sid] = (map[sid] || 0) + 1;
      return map;
    }, {});

    const lessonDocs = await Lesson.find({ chapterId: { $in: chapters.map((chapter) => chapter._id) } }).select('chapterId type');
    const lessonsBySubject = lessonDocs.reduce((map, lesson) => {
      const subjectId = chapterIdToSubjectId[lesson.chapterId.toString()];
      if (!subjectId) return map;
      map[subjectId] = map[subjectId] || { total: 0, video: 0, note: 0 };
      map[subjectId].total += 1;
      if (lesson.type === 'video') {
        map[subjectId].video += 1;
      } else if (lesson.type === 'note') {
        map[subjectId].note += 1;
      }
      return map;
    }, {});

    const subjectsWithCounts = subjects.map((assignment) => {
      const subjectId = assignment.subjectId._id.toString();
      const lessonStats = lessonsBySubject[subjectId] || { total: 0, video: 0, note: 0 };

      return {
        ...assignment.toObject(),
        chapterCount: chaptersBySubject[subjectId] || 0,
        lessonCount: lessonStats.total,
        videoCount: lessonStats.video,
        noteCount: lessonStats.note
      };
    });

    res.json(subjectsWithCounts);
  } catch (error) {
    console.error('[SUBJECT-ASSIGNMENTS] Error fetching student subjects:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

// Apply admin role middleware to remaining routes
router.use(roleMiddleware(['admin', 'super_admin']));

// 🔹 GET /api/subject-assignments - Get subjects by class
// ✅ Fetches all subjects assigned to a specific class with teacher details
router.get('/', async (req, res) => {
  try {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ 
        message: 'classId query parameter is required' 
      });
    }

    // Verify class exists and belongs to user's school
    const classExists = await Class.findOne({
      _id: classId,
      school: req.user.school
    });

    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get all subjects for the class
    const subjects = await SubjectAssignment.find({
      classId,
      schoolId: req.user.school
    })
    .populate('subjectId', 'name')
    .populate('teacherId', 'name email profileImage')
    .sort({ subjectId: 1 });

    res.json(subjects);
  } catch (error) {
    console.error('[SUBJECT-ASSIGNMENTS] Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

// 🔹 POST /api/subject-assignments - Create subject assignment
// ✅ Creates a new subject for a class with teacher assignment
router.post('/', async (req, res) => {
  try {
    const { subjectId, name, classId, teacherId } = req.body;

    // ✅ Validation: Required payload fields
    if (!classId || !teacherId || (!subjectId && !name)) {
      return res.status(400).json({
        message: 'subjectId or name, classId, and teacherId are required'
      });
    }

    // Resolve subjectId from payload or subject name
    let resolvedSubjectId = subjectId;
    if (!resolvedSubjectId) {
      let subject = await Subject.findOne({
        name: new RegExp(`^${name.trim()}$`, 'i'),
        schoolId: req.user.school
      });

      if (!subject) {
        // Create new subject if it doesn't exist
        subject = new Subject({
          name: name.trim(),
          schoolId: req.user.school
        });
        await subject.save();
      }
      resolvedSubjectId = subject._id;
    }

    // Validate ObjectId values
    if (
      !mongoose.Types.ObjectId.isValid(resolvedSubjectId) ||
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(teacherId)
    ) {
      return res.status(400).json({ message: 'Invalid subjectId, classId, or teacherId' });
    }

    // ✅ Validate: Class exists and belongs to user's school
    const classExists = await Class.findOne({
      _id: classId,
      school: req.user.school
    });

    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // ✅ Validate: Teacher exists and has teacher role in the same school
    const teacher = await User.findOne({
      _id: teacherId,
      role: 'teacher',
      school: req.user.school
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found in your school' });
    }

    // ✅ Validate: No duplicate subject assignment in the same class per school
    const existingSubject = await SubjectAssignment.findOne({
      subjectId: resolvedSubjectId,
      classId,
      schoolId: req.user.school
    });

    if (existingSubject) {
      return res.status(400).json({
        message: 'Subject already exists for this class'
      });
    }

    // ✅ Create new subject assignment
    const subjectAssignment = new SubjectAssignment({
      subjectId: resolvedSubjectId,
      classId,
      teacherId,
      schoolId: req.user.school
    });

    await subjectAssignment.save();

    // ✅ Populate teacher details and return
    const populatedSubject = await SubjectAssignment.findById(subjectAssignment._id)
      .populate('subjectId', 'title description')
      .populate('teacherId', 'name email profileImage');

    console.log('[SUBJECT-ASSIGNMENTS] Subject created:', populatedSubject._id);

    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error('[SUBJECT-ASSIGNMENTS] Error creating subject:', error);

    // ✅ Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Subject already exists for this class'
      });
    }

    // ✅ Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: messages.join(', ')
      });
    }

    res.status(500).json({ message: 'Server error while creating subject' });
  }
});

// 🔹 PUT /api/subject-assignments/:id - Update subject assignment
// ✅ Updates subject name and/or teacher assignment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectId, name, teacherId } = req.body;

    // ✅ Validate: At least one updatable field provided
    if (!subjectId && !name && !teacherId) {
      return res.status(400).json({
        message: 'At least one of subjectId, name, or teacherId must be provided'
      });
    }

    // ✅ Find subject assignment for the school
    const subjectAssignment = await SubjectAssignment.findOne({
      _id: id,
      schoolId: req.user.school
    });

    if (!subjectAssignment) {
      return res.status(404).json({ message: 'Subject assignment not found' });
    }

    let resolvedSubjectId = subjectId;
    if (name && !resolvedSubjectId) {
      const subject = await Subject.findOne({
        name: new RegExp(`^${name.trim()}$`, 'i'),
        schoolId: req.user.school
      });

      if (!subject) {
        return res.status(400).json({
          message: 'A valid subjectId or existing subject name is required to update this assignment'
        });
      }

      resolvedSubjectId = subject._id;
    }

    if (resolvedSubjectId && resolvedSubjectId.toString() !== subjectAssignment.subjectId.toString()) {
      if (!mongoose.Types.ObjectId.isValid(resolvedSubjectId)) {
        return res.status(400).json({ message: 'Invalid subjectId' });
      }

      const duplicateAssignment = await SubjectAssignment.findOne({
        subjectId: resolvedSubjectId,
        classId: subjectAssignment.classId,
        schoolId: req.user.school,
        _id: { $ne: id }
      });

      if (duplicateAssignment) {
        return res.status(400).json({
          message: 'This subject is already assigned to the class'
        });
      }

      subjectAssignment.subjectId = resolvedSubjectId;
    }

    // ✅ If updating teacher, verify teacher exists
    if (teacherId && teacherId !== subjectAssignment.teacherId.toString()) {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: 'Invalid teacherId' });
      }

      const teacher = await User.findOne({
        _id: teacherId,
        role: 'teacher',
        school: req.user.school
      });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found in your school' });
      }

      subjectAssignment.teacherId = teacherId;
    }

    await subjectAssignment.save();

    // ✅ Populate and return updated subject
    const updatedSubject = await SubjectAssignment.findById(id)
      .populate('subjectId', 'name')
      .populate('teacherId', 'name email profileImage');

    console.log('[SUBJECT-ASSIGNMENTS] Subject updated:', id);

    res.json(updatedSubject);
  } catch (error) {
    console.error('[SUBJECT-ASSIGNMENTS] Error updating subject:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: messages.join(', ')
      });
    }

    res.status(500).json({ message: 'Server error while updating subject' });
  }
});

// 🔹 DELETE /api/subject-assignments/:id - Delete subject assignment
// ✅ Removes a subject from a class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const subjectAssignment = await SubjectAssignment.findOneAndDelete({
      _id: id,
      schoolId: req.user.school
    });

    if (!subjectAssignment) {
      return res.status(404).json({ message: 'Subject assignment not found' });
    }

    console.log('[SUBJECT-ASSIGNMENTS] Subject deleted:', id);

    res.json({ 
      message: 'Subject assignment deleted successfully',
      deletedSubject: subjectAssignment
    });
  } catch (error) {
    console.error('[SUBJECT-ASSIGNMENTS] Error deleting subject:', error);
    res.status(500).json({ message: 'Server error while deleting subject' });
  }
});

module.exports = router;
