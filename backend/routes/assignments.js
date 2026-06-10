const express = require('express');
const mongoose = require('mongoose');

const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const Submission = require('../models/Submission');
const SubjectAssignment = require('../models/SubjectAssignment');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getSchoolId = (user) => user.school || user.schoolId;

const sanitizeQuestion = (question) => ({
  questionText: question.questionText,
  type: question.type,
  options: question.type === 'mcq' ? question.options || [] : [],
});

const validateAssignmentPayload = (body) => {
  const requiredFields = ['title', 'type', 'duration', 'startTime', 'endTime', 'totalMarks', 'numberOfQuestions', 'classId'];
  const missingField = requiredFields.find((field) => body[field] === undefined || body[field] === null || body[field] === '');

  if (missingField) {
    return `${missingField} is required.`;
  }

  if (!['mcq', 'qa', 'mixed'].includes(body.type)) {
    return 'Assignment type must be mcq, qa, or mixed.';
  }

  if (!isObjectId(body.classId)) {
    return 'A valid classId is required.';
  }

  const duration = Number(body.duration);
  const totalMarks = Number(body.totalMarks);
  const numberOfQuestions = Number(body.numberOfQuestions);
  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);

  if (!Number.isFinite(duration) || duration <= 0) {
    return 'Duration must be greater than zero.';
  }

  if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
    return 'Total marks must be greater than zero.';
  }

  if (!Number.isInteger(totalMarks)) {
    return 'Total marks must be a whole number.';
  }

  if (!Number.isInteger(numberOfQuestions) || numberOfQuestions <= 0) {
    return 'Number of questions must be a positive integer.';
  }

  if (totalMarks % numberOfQuestions !== 0) {
    return 'Total marks must divide equally across all questions.';
  }

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
    return 'A valid startTime and endTime are required, and endTime must be after startTime.';
  }

  if (!Array.isArray(body.questions) || body.questions.length !== numberOfQuestions) {
    return 'Questions must match numberOfQuestions.';
  }

  for (const question of body.questions) {
    if (!question.questionText || !['mcq', 'qa'].includes(question.type)) {
      return 'Each question must include questionText and type.';
    }

    if (body.type !== 'mixed' && question.type !== body.type) {
      return 'Question types must match assignment type unless assignment type is mixed.';
    }

    if (question.type === 'mcq' && (!Array.isArray(question.options) || question.options.filter(Boolean).length < 2)) {
      return 'Each MCQ question must include at least two options.';
    }

    if (question.type === 'qa' && Array.isArray(question.options) && question.options.length > 0) {
      return 'Q&A questions cannot include options.';
    }

    if ('correctAnswer' in question) {
      return 'Assignments cannot include correctAnswer. All grading is manual.';
    }
  }

  return null;
};

const assertTeacherCanUseClass = async (teacherId, classId) => {
  const classroom = await Class.findOne({ _id: classId, classTeacher: teacherId });
  if (classroom) {
    return classroom;
  }

  const subjectAssignment = await SubjectAssignment.findOne({ classId, teacherId }).populate('classId');
  if (!subjectAssignment?.classId) {
    const error = new Error('Teachers can only create assignments for their assigned class.');
    error.statusCode = 403;
    throw error;
  }

  return subjectAssignment.classId;
};

router.post('/', roleMiddleware(['teacher']), async (req, res) => {
  try {
    const validationError = validateAssignmentPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const classroom = await assertTeacherCanUseClass(req.user._id, req.body.classId);
    const questions = req.body.questions.map(sanitizeQuestion);
    const totalMarks = Number(req.body.totalMarks);
    const numberOfQuestions = Number(req.body.numberOfQuestions);

    const assignment = await Assignment.create({
      title: req.body.title,
      description: req.body.description || '',
      type: req.body.type,
      duration: Number(req.body.duration),
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
      totalMarks,
      numberOfQuestions,
      // marksPerQuestion: totalMarks / numberOfQuestions,
      marksPerQuestion: Math.round(totalMarks / numberOfQuestions),
      questions,
      classId: classroom._id,
      schoolId: classroom.schoolId || classroom.school || getSchoolId(req.user),
      teacherId: req.user._id,
      status: 'published',
    });

    return res.status(201).json({ message: 'Assignment created successfully.', assignment });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to create assignment.' });
  }
});

router.get('/', roleMiddleware(['student', 'teacher', 'admin', 'super_admin']), async (req, res) => {
  try {
    const now = new Date();
    const query = {};

    if (req.user.role === 'student') {
      const classId = req.user.class || req.user.classId;
      if (!classId) {
        return res.json([]);
      }
      query.classId = classId;
      query.status = 'published';
    } else if (req.user.role === 'teacher') {
      query.teacherId = req.user._id;
    } else if (req.user.role === 'admin') {
      query.schoolId = getSchoolId(req.user);
    }

    const assignments = await Assignment.find(query)
      .populate('classId', 'name section academicYear')
      .populate('teacherId', 'name email')
      .sort({ startTime: -1 });

    if (req.user.role !== 'student') {
      return res.json(assignments);
    }

    const assignmentIds = assignments.map((assignment) => assignment._id);
    const submissions = await Submission.find({
      assignmentId: { $in: assignmentIds },
      studentId: req.user._id,
    }).select('assignmentId status submittedAt totalMarks');

    const submissionMap = new Map(submissions.map((submission) => [submission.assignmentId.toString(), submission]));

    return res.json(
      assignments.map((assignment) => {
        const plain = assignment.toObject();
        const submission = submissionMap.get(assignment._id.toString()) || null;
        plain.submission = submission;
        plain.isActive = now >= assignment.startTime && now <= assignment.endTime;
        return plain;
      })
    );
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch assignments.' });
  }
});

module.exports = router;
