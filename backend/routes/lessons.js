const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const Lesson = require('../models/Lesson');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');

// Get lessons for a chapter
const getLessons = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Verify chapter exists and user has access
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Verify subject access
    const subject = await Subject.findById(chapter.subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check access permissions through subject assignment.
    if (req.user.role === 'student') {
      // Add enrollment check if needed
    } else if (req.user.role === 'teacher') {
      if (chapter.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this chapter' });
      }
    }

    const lessons = await Lesson.find({ chapterId, isActive: true })
      .sort({ order: 1 });

    res.json(lessons);
  } catch (error) {
    console.error('[LESSON] Error getting lessons:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Create lesson (teacher only)
const createLesson = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, type, videoUrl, fileUrl, order } = req.body;

    console.log(`[LESSON] Creating lesson for chapter: ${chapterId}, type: ${type}`);

    // Verify chapter exists and teacher owns it
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      console.log(`[LESSON] Chapter not found: ${chapterId}`);
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (chapter.createdBy.toString() !== req.user._id.toString()) {
      console.log(`[LESSON] Unauthorized: teacher ${req.user._id} trying to create lesson for chapter ${chapter._id}`);
      return res.status(403).json({ message: 'Not authorized to create lessons for this chapter' });
    }

    const lesson = new Lesson({
      chapterId,
      createdBy: req.user._id,
      title,
      type,
      videoUrl,
      fileUrl,
      order: order || 0
    });

    await lesson.save();

    console.log(`[LESSON] Lesson created successfully: ${lesson._id}`);
    res.status(201).json(lesson);
  } catch (error) {
    console.error(`[LESSON] Error creating lesson: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Update lesson (teacher only)
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, videoUrl, fileUrl, order } = req.body;

    console.log(`[LESSON] Updating lesson: ${id}`);

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      console.log(`[LESSON] Lesson not found: ${id}`);
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Verify ownership
    const chapter = await Chapter.findById(lesson.chapterId);
    if (chapter.createdBy.toString() !== req.user._id.toString()) {
      console.log(`[LESSON] Unauthorized: teacher ${req.user._id} trying to update lesson ${id}`);
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    lesson.title = title || lesson.title;
    lesson.type = type || lesson.type;
    lesson.videoUrl = videoUrl !== undefined ? videoUrl : lesson.videoUrl;
    lesson.fileUrl = fileUrl !== undefined ? fileUrl : lesson.fileUrl;
    lesson.order = order !== undefined ? order : lesson.order;

    await lesson.save();

    console.log(`[LESSON] Lesson updated successfully: ${id}`);
    res.json(lesson);
  } catch (error) {
    console.error(`[LESSON] Error updating lesson ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Delete lesson (teacher only)
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[LESSON] Deleting lesson: ${id}`);

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      console.log(`[LESSON] Lesson not found: ${id}`);
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Verify ownership
    const chapter = await Chapter.findById(lesson.chapterId);
    if (chapter.createdBy.toString() !== req.user._id.toString()) {
      console.log(`[LESSON] Unauthorized: teacher ${req.user._id} trying to delete lesson ${id}`);
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    await lesson.deleteOne();

    console.log(`[LESSON] Lesson deleted successfully: ${id}`);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error(`[LESSON] Error deleting lesson ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Upload lesson file
const uploadLessonFile = async (req, res) => {
  try {
    const { chapterId } = req.params;

    console.log(`[LESSON] Uploading file for chapter: ${chapterId}`);

    // Verify chapter exists and teacher owns it
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      console.log(`[LESSON] Chapter not found: ${chapterId}`);
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (chapter.createdBy.toString() !== req.user._id.toString()) {
      console.log(`[LESSON] Unauthorized: teacher ${req.user._id} trying to upload file for chapter ${chapter._id}`);
      return res.status(403).json({ message: 'Not authorized to upload files for this chapter' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const file = req.file;
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'application/pdf'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only video and PDF files are allowed' });
    }

    if (file.size > maxSize) {
      return res.status(400).json({ message: 'File size too large. Maximum 100MB allowed' });
    }

    // Generate unique filename
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${safeName}`;
    const uploadDir = path.join(__dirname, '..', 'uploads', 'lessons');
    const uploadPath = path.join(uploadDir, fileName);

    // Move file to uploads directory
    await fs.promises.mkdir(uploadDir, { recursive: true });
    await fs.promises.writeFile(uploadPath, file.buffer);

    const fileUrl = `/uploads/lessons/${fileName}`;

    console.log(`[LESSON] File uploaded successfully: ${fileUrl}`);
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });
  } catch (error) {
    console.error(`[LESSON] Error uploading file: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Get single lesson by ID
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Verify chapter exists
    const chapter = await Chapter.findById(lesson.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Check access permissions based on subject assignments
    if (req.user.role === 'student') {
      const SubjectAssignment = require('../models/SubjectAssignment');
      const isAssignedToClass = await SubjectAssignment.exists({
        subjectId: chapter.subjectId,
        classId: req.user.class,
        schoolId: req.user.school
      });

      if (!isAssignedToClass) {
        return res.status(403).json({ message: 'Not authorized to view this lesson' });
      }
    } else if (req.user.role === 'teacher') {
      const SubjectAssignment = require('../models/SubjectAssignment');
      const isAssignedTeacher = await SubjectAssignment.exists({
        subjectId: chapter.subjectId,
        teacherId: req.user._id,
        schoolId: req.user.school
      });

      if (!isAssignedTeacher) {
        return res.status(403).json({ message: 'Not authorized to view this lesson' });
      }
    }

    res.json(lesson);
  } catch (error) {
    console.error(`[LESSON] Error getting lesson ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Get lessons for a chapter.
const getLessonsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Check access permissions based on subject assignments
    if (req.user.role === 'student') {
      const SubjectAssignment = require('../models/SubjectAssignment');
      const isAssignedToClass = await SubjectAssignment.exists({
        subjectId: chapter.subjectId,
        classId: req.user.class,
        schoolId: req.user.school
      });

      if (!isAssignedToClass) {
        return res.status(403).json({ message: 'Not authorized to view this chapter' });
      }
    } else if (req.user.role === 'teacher') {
      const SubjectAssignment = require('../models/SubjectAssignment');
      const isAssignedTeacher = await SubjectAssignment.exists({
        subjectId: chapter.subjectId,
        teacherId: req.user._id,
        schoolId: req.user.school
      });

      if (!isAssignedTeacher) {
        return res.status(403).json({ message: 'Not authorized to view this chapter' });
      }
    }

    // Get all lessons for the chapter
    const lessons = await Lesson.find({ chapterId })
      .sort({ createdAt: 1 });

    res.json(lessons);
  } catch (error) {
    console.error(`[LESSON] Error getting lessons by chapter: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Get all video lessons for student assigned subjects
const getVideoLessons = async (req, res) => {
  try {
    // Find all subject assignments for the student
    const SubjectAssignment = require('../models/SubjectAssignment');
    const assignments = await SubjectAssignment.find({
      classId: req.user.class,
      schoolId: req.user.school
    }).select('subjectId');

    const subjectIds = assignments.map(a => a.subjectId);

    if (subjectIds.length === 0) {
      return res.json([]);
    }

    // Find all chapters in those subjects
    const chapters = await Chapter.find({ subjectId: { $in: subjectIds } }).select('_id subjectId');
    const chapterIds = chapters.map(chapter => chapter._id);

    // Find all video lessons in those chapters
    const videoLessons = await Lesson.find({
      chapterId: { $in: chapterIds },
      type: 'video'
    })
    .populate({
      path: 'chapterId',
      select: 'title subjectId',
      populate: {
        path: 'subjectId',
        select: 'title createdBy'
      }
    })
    .sort({ createdAt: -1 });

    res.json(videoLessons);
  } catch (error) {
    console.error(`[LESSON] Error getting video lessons: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const router = express.Router();
const lessonUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// All lesson routes require authentication
router.use(authMiddleware);

// Specific routes (must come before dynamic :id route)
router.get('/videos', roleMiddleware('student'), getVideoLessons);
router.get('/chapter/:chapterId', getLessonsByChapter);

// Dynamic route (must come after specific routes)
router.get('/:id', getLessonById);

// Mutation routes
router.post('/chapter/:chapterId', roleMiddleware('teacher'), createLesson);
router.put('/:id', roleMiddleware('teacher'), updateLesson);
router.delete('/:id', roleMiddleware('teacher'), deleteLesson);
router.post('/chapter/:chapterId/upload', roleMiddleware('teacher'), lessonUpload.single('file'), uploadLessonFile);
// router.post('/:id/complete', roleMiddleware('student'), markLessonComplete); // Removed as no completion tracking

module.exports = router;
