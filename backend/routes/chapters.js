const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const SubjectAssignment = require('../models/SubjectAssignment');

// Get chapters for a subject
const getChapters = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check access permissions based on subject assignments
    if (req.user.role === 'student') {
      const isAssignedToClass = await SubjectAssignment.exists({
        subjectId,
        classId: req.user.class,
        schoolId: req.user.school
      });

      if (!isAssignedToClass) {
        return res.status(403).json({ message: 'Not authorized to view this subject' });
      }
    } else if (req.user.role === 'teacher') {
      const isAssignedTeacher = await SubjectAssignment.exists({
        subjectId,
        teacherId: req.user._id,
        schoolId: req.user.school
      });

      if (!isAssignedTeacher) {
        return res.status(403).json({ message: 'Not authorized to view this subject' });
      }
    }

    const chapters = await Chapter.find({ subjectId, isActive: true })
      .sort({ order: 1 });

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create chapter (teacher only)
const createChapter = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { title, description, order } = req.body;

    // Verify subject exists and teacher is assigned to it
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const isAssignedTeacher = await SubjectAssignment.exists({
      subjectId,
      teacherId: req.user._id,
      schoolId: req.user.school || req.user.schoolId
    });

    if (!isAssignedTeacher) {
      return res.status(403).json({ message: 'Not authorized to add chapters to this subject' });
    }

    const chapter = new Chapter({
      subjectId,
      createdBy: req.user._id,
      title,
      description,
      order: order || 0
    });

    await chapter.save();

    res.status(201).json(chapter);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update chapter (teacher only)
const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (chapter.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this chapter' });
    }

    Object.assign(chapter, req.body);
    await chapter.save();

    res.json(chapter);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete chapter (teacher only)
const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (chapter.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this chapter' });
    }

    await chapter.deleteOne();
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const router = express.Router();

// All chapter routes require authentication
router.use(authMiddleware);

// Get chapters for a subject (students and teachers)
router.get('/subject/:subjectId', getChapters);

// Teacher-only routes
router.post('/subject/:subjectId', roleMiddleware('teacher'), createChapter);
router.put('/:id', roleMiddleware('teacher'), updateChapter);
router.delete('/:id', roleMiddleware('teacher'), deleteChapter);

module.exports = router;
