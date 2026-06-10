const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const SubjectAssignment = require('../models/SubjectAssignment');
const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

const router = express.Router();
const lessonUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// All routes require authentication and teacher role
router.use(authMiddleware);
router.use(roleMiddleware(['teacher']));

// Helper function to validate teacher ownership and return the assignment
const validateTeacherOwnership = async (teacherId, subjectId, schoolId) => {
  return await SubjectAssignment.findOne({
    teacherId,
    subjectId,
    schoolId
  });
};

// GET /api/teacher/subjects - Get subjects assigned to teacher
router.get('/subjects', async (req, res) => {
  try {
    const assignments = await SubjectAssignment.find({
      teacherId: req.user._id,
      schoolId: req.user.school
    })
    .populate('subjectId', 'name')
    .populate('classId', 'name section')
    .populate('schoolId', 'name');

    const subjects = assignments.map(assignment => ({
      _id: assignment.subjectId._id,
      title: assignment.subjectId.name,
      description: '',
      class: assignment.classId,
      school: assignment.schoolId,
      assignmentId: assignment._id
    }));

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teacher/students - Get students in teacher's classes and assigned subject classes
router.get('/students', async (req, res) => {
  try {
    const classTeacherClasses = await Class.find({
      classTeacher: req.user._id,
      school: req.user.school
    }).select('_id');

    const subjectAssignments = await SubjectAssignment.find({
      teacherId: req.user._id,
      schoolId: req.user.school
    }).select('classId');

    const classIds = [
      ...classTeacherClasses.map((cls) => cls._id.toString()),
      ...subjectAssignments.map((assignment) => assignment.classId.toString())
    ];

    const uniqueClassIds = [...new Set(classIds)];

    const students = await User.find({
      role: 'student',
      class: { $in: uniqueClassIds }
    })
      .populate('class', 'name section')
      .select('name email phone class')
      .sort({ name: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teacher/classes - Get classes assigned to teacher
router.get('/classes', async (req, res) => {
  try {
    const classTeacherClasses = await Class.find({
      classTeacher: req.user._id,
      school: req.user.school
    }).select('_id');

    const subjectAssignments = await SubjectAssignment.find({
      teacherId: req.user._id,
      schoolId: req.user.school
    }).select('classId');

    const classIds = [
      ...classTeacherClasses.map((cls) => cls._id.toString()),
      ...subjectAssignments.map((assignment) => assignment.classId.toString())
    ];

    const uniqueClassIds = [...new Set(classIds)];
    const classes = await Class.find({ _id: { $in: uniqueClassIds } })
      .populate('classTeacher', 'name email')
      .sort({ name: 1, section: 1 });

    res.json(classes);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teacher/chapters - Create chapter
router.post('/chapters', async (req, res) => {
  try {
    const { subjectId, title, description, order } = req.body;

    // Validate teacher owns the subject
    const assignment = await validateTeacherOwnership(req.user._id, subjectId, req.user.school);
    if (!assignment) {
      return res.status(403).json({ message: 'Not authorized to manage this subject' });
    }

    const chapter = new Chapter({
      subjectId,
      classId: assignment.classId,
      createdBy: req.user._id,
      title,
      description,
      order: order || 0
    });

    await chapter.save();
    await chapter.populate('subjectId', 'name');

    res.status(201).json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teacher/chapters/:subjectId - Get chapters for subject
router.get('/chapters/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Validate teacher owns the subject
    const isOwner = await validateTeacherOwnership(req.user._id, subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this subject' });
    }

    const chapters = await Chapter.find({ subjectId })
      .sort({ order: 1 })
      .populate('subjectId', 'name');

    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/teacher/chapters/:id - Update chapter
router.put('/chapters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Validate teacher owns the subject
    const isOwner = await validateTeacherOwnership(req.user._id, chapter.subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to manage this subject' });
    }

    chapter.title = title || chapter.title;
    chapter.description = description || chapter.description;
    chapter.order = order !== undefined ? order : chapter.order;

    await chapter.save();
    await chapter.populate('subjectId', 'name');

    res.json(chapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/teacher/chapters/:id - Delete chapter
router.delete('/chapters/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Validate teacher owns the subject
    const isOwner = await validateTeacherOwnership(req.user._id, chapter.subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to manage this subject' });
    }

    // Delete associated lessons
    await Lesson.deleteMany({ chapterId: id });

    await chapter.deleteOne();

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teacher/lessons - Create lesson
router.post('/lessons', async (req, res) => {
  try {
    const { chapterId, title, type, videoUrl, fileUrl, order } = req.body;

    // Get chapter to validate subject ownership
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Validate teacher owns the subject
    const isOwner = await validateTeacherOwnership(req.user._id, chapter.subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to manage this subject' });
    }

    const lesson = new Lesson({
      chapterId,
      createdBy: req.user._id,
      title,
      type,
      videoUrl: type === 'video' ? videoUrl : null,
      fileUrl: type === 'note' ? fileUrl : null,
      order: order || 0
    });

    await lesson.save();
    await lesson.populate('chapterId', 'title');

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teacher/lessons/:chapterId/upload - Upload lesson file for chapter
router.post('/lessons/:chapterId/upload', lessonUpload.single('file'), async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const isOwner = await validateTeacherOwnership(req.user._id, chapter.subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to upload files for this chapter' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/webm',
      'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only video, PDF, DOC, DOCX, and TXT files are allowed' });
    }

    if (file.size > maxSize) {
      return res.status(400).json({ message: 'File size too large. Maximum 100MB allowed' });
    }

    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${safeName}`;
    const uploadDir = path.join(__dirname, '..', 'uploads', 'lessons');
    const uploadPath = path.join(uploadDir, fileName);

    await fs.promises.mkdir(uploadDir, { recursive: true });
    await fs.promises.writeFile(uploadPath, file.buffer);

    const fileUrl = `/uploads/lessons/${fileName}`;

    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });
  } catch (error) {
    console.error('Error uploading lesson file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teacher/lessons/:chapterId - Get lessons for chapter
router.get('/lessons/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Get chapter to validate subject ownership
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Validate teacher owns the subject
    const isOwner = await validateTeacherOwnership(req.user._id, chapter.subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this subject' });
    }

    const lessons = await Lesson.find({ chapterId })
      .sort({ order: 1 })
      .populate('chapterId', 'title');

    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/teacher/lessons/:id - Update lesson
router.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, videoUrl, fileUrl, order } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Get chapter to validate subject ownership
    const chapter = await Chapter.findById(lesson.chapterId);
    const isOwner = await validateTeacherOwnership(req.user._id, chapter.subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to manage this subject' });
    }

    lesson.title = title || lesson.title;
    lesson.type = type || lesson.type;
    if (type === 'video') {
      lesson.videoUrl = videoUrl || lesson.videoUrl;
      lesson.fileUrl = null;
    } else if (type === 'note') {
      lesson.fileUrl = fileUrl || lesson.fileUrl;
      lesson.videoUrl = null;
    }
    lesson.order = order !== undefined ? order : lesson.order;

    await lesson.save();
    await lesson.populate('chapterId', 'title');

    res.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/teacher/lessons/:id - Delete lesson
router.delete('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Get chapter to validate subject ownership
    const chapter = await Chapter.findById(lesson.chapterId);
    const isOwner = await validateTeacherOwnership(req.user._id, chapter.subjectId, req.user.school);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to manage this subject' });
    }

    await lesson.deleteOne();

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
