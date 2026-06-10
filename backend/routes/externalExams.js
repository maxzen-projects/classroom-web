const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ExternalExam = require('../models/ExternalExam');
const ExamMark = require('../models/ExamMark');
const User = require('../models/User');

const router = express.Router();

router.use(authMiddleware);

// Get all exams for school/teacher/student
router.get('/', async (req, res) => {
  try {
    let query = { schoolId: req.user.school };
    
    if (req.user.role === 'teacher') {
      query.teacherId = req.user._id;
    } else if (req.user.role === 'student') {
      if (req.user.class) {
        query.classId = req.user.class;
      }
    }

    const exams = await ExternalExam.find(query)
      .populate('subjectId', 'name')
      .populate('classId', 'name section')
      .populate('teacherId', 'name')
      .sort({ examDate: -1 });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exam by ID
router.get('/:id', async (req, res) => {
  try {
    const exam = await ExternalExam.findById(req.params.id)
      .populate('subjectId', 'name')
      .populate('classId', 'name section')
      .populate('teacherId', 'name');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create exam (admin/teacher)
router.post('/', roleMiddleware(['admin', 'teacher']), async (req, res) => {
  try {
    const { title, description, examDate, subjectId, classId, totalMarks, passingMarks } = req.body;

    if (!title || !examDate || !subjectId || !classId || !totalMarks || passingMarks === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exam = new ExternalExam({
      title,
      description,
      examDate,
      subjectId,
      classId,
      schoolId: req.user.school,
      teacherId: req.user._id,
      totalMarks,
      passingMarks
    });

    await exam.save();
    await exam.populate('subjectId', 'name');
    await exam.populate('classId', 'name section');
    await exam.populate('teacherId', 'name');

    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update exam (admin/teacher)
router.put('/:id', roleMiddleware(['admin', 'teacher']), async (req, res) => {
  try {
    const exam = await ExternalExam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user.role === 'teacher' && exam.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedExam = await ExternalExam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('subjectId', 'name')
      .populate('classId', 'name section')
      .populate('teacherId', 'name');

    res.json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete exam (admin/teacher)
router.delete('/:id', roleMiddleware(['admin', 'teacher']), async (req, res) => {
  try {
    const exam = await ExternalExam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user.role === 'teacher' && exam.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await ExternalExam.findByIdAndDelete(req.params.id);
    await ExamMark.deleteMany({ examId: req.params.id });

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get marks for an exam
router.get('/:examId/marks', async (req, res) => {
  try {
    const marks = await ExamMark.find({ examId: req.params.examId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get marks for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const marks = await ExamMark.find({ studentId: req.params.studentId })
      .populate('examId', 'title examDate totalMarks subjectId')
      .populate('gradedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add/Update exam mark (teacher/admin)
router.post('/marks', roleMiddleware(['admin', 'teacher']), async (req, res) => {
  try {
    const { examId, studentId, marksObtained, remarks } = req.body;

    if (!examId || !studentId || marksObtained === undefined) {
      return res.status(400).json({ message: 'Exam, student and marks are required' });
    }

    const exam = await ExternalExam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (marksObtained > exam.totalMarks) {
      return res.status(400).json({ message: 'Marks cannot exceed total marks' });
    }

    let mark = await ExamMark.findOne({ examId, studentId });

    if (mark) {
      mark.marksObtained = marksObtained;
      mark.remarks = remarks;
      mark.gradedBy = req.user._id;
      mark.gradedAt = new Date();
    } else {
      mark = new ExamMark({
        examId,
        studentId,
        schoolId: req.user.school,
        marksObtained,
        remarks,
        gradedBy: req.user._id
      });
    }

    await mark.save();
    await mark.populate('studentId', 'name email');
    await mark.populate('examId', 'title');

    res.status(mark.isNew ? 201 : 200).json({ message: 'Mark saved successfully', mark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete exam mark
router.delete('/marks/:id', roleMiddleware(['admin', 'teacher']), async (req, res) => {
  try {
    const mark = await ExamMark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }
    await ExamMark.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mark deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student performance (attendance + assignments + exams)
router.get('/performance/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const schoolId = req.user.school;

    // Get attendance percentage
    const Attendance = require('../models/Attendance');
    const totalAttendance = await Attendance.countDocuments({ studentId, schoolId });
    const presentAttendance = await Attendance.countDocuments({ studentId, schoolId, status: 'present' });
    const attendancePercentage = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

    // Get assignment percentage
    const Assignment = require('../models/Assignment');
    const Submission = require('../models/Submission');
    const student = await User.findById(studentId);
    const assignments = await Assignment.find({ classId: student?.class, schoolId });
    let totalAssignmentMarks = 0;
    let obtainedAssignmentMarks = 0;
    for (const assignment of assignments) {
      const submission = await Submission.findOne({ assignmentId: assignment._id, studentId });
      if (submission && submission.totalMarks !== null) {
        totalAssignmentMarks += assignment.totalMarks;
        obtainedAssignmentMarks += submission.totalMarks;
      }
    }
    const assignmentPercentage = totalAssignmentMarks > 0 ? (obtainedAssignmentMarks / totalAssignmentMarks) * 100 : 0;

    // Get exam percentage
    const examMarks = await ExamMark.find({ studentId, schoolId }).populate('examId', 'totalMarks');
    let totalExamMarks = 0;
    let obtainedExamMarks = 0;
    for (const mark of examMarks) {
      if (mark.examId) {
        totalExamMarks += mark.examId.totalMarks;
        obtainedExamMarks += mark.marksObtained;
      }
    }
    const examPercentage = totalExamMarks > 0 ? (obtainedExamMarks / totalExamMarks) * 100 : 0;

    // Calculate overall performance
    const overallPerformance = (attendancePercentage * 0.2) + (assignmentPercentage * 0.3) + (examPercentage * 0.5);

    res.json({
      attendancePercentage,
      assignmentPercentage,
      examPercentage,
      overallPerformance: Math.round(overallPerformance * 100) / 100
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
