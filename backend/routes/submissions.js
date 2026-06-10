const express = require('express');
const mongoose = require('mongoose');

const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getStudentClassId = (user) => user.class || user.classId;

const formatMarks = (value) => {
  const marks = Number(value);
  if (!Number.isFinite(marks)) {
    return '0';
  }
  return Number.isInteger(marks) ? String(marks) : marks.toFixed(2);
};

const findAccessibleAssignmentForStudent = async (assignmentId, student) => {
  if (!isObjectId(assignmentId)) {
    const error = new Error('A valid assignmentId is required.');
    error.statusCode = 400;
    throw error;
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment || assignment.status !== 'published') {
    const error = new Error('Assignment not found.');
    error.statusCode = 404;
    throw error;
  }

  const studentClassId = getStudentClassId(student);
  if (!studentClassId || assignment.classId.toString() !== studentClassId.toString()) {
    const error = new Error('You do not have access to this assignment.');
    error.statusCode = 403;
    throw error;
  }

  return assignment;
};

const normalizeAnswers = (assignment, answers = []) => {
  const answerMap = new Map(
    answers.map((answer) => [
      answer.questionId?.toString(),
      answer.answer === undefined || answer.answer === null ? '' : answer.answer,
    ])
  );

  return assignment.questions.map((question) => ({
    questionId: question._id,
    answer: answerMap.get(question._id.toString()) || '',
  }));
};

const assertWithinStartWindow = (assignment) => {
  const now = new Date();
  if (now < assignment.startTime || now > assignment.endTime) {
    const error = new Error('Assignment can only be started within its scheduled time window.');
    error.statusCode = 403;
    throw error;
  }
};

const assertTeacherOwnsAssignment = async (assignmentId, teacherId) => {
  if (!isObjectId(assignmentId)) {
    const error = new Error('A valid assignmentId is required.');
    error.statusCode = 400;
    throw error;
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, teacherId });
  if (!assignment) {
    const error = new Error('Assignment not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  return assignment;
};

router.post('/start', roleMiddleware(['student']), async (req, res) => {
  try {
    const assignment = await findAccessibleAssignmentForStudent(req.body.assignmentId, req.user);
    assertWithinStartWindow(assignment);

    const existingSubmission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      if (existingSubmission.status !== 'in-progress') {
        return res.status(409).json({ message: 'You have already submitted this assignment.' });
      }
      return res.json({ assignment, submission: existingSubmission });
    }

    const submission = await Submission.create({
      assignmentId: assignment._id,
      studentId: req.user._id,
      answers: normalizeAnswers(assignment),
      status: 'in-progress',
      startedAt: new Date(),
    });

    return res.status(201).json({ assignment, submission });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to start assignment.' });
  }
});

router.post('/submit', roleMiddleware(['student']), async (req, res) => {
  try {
    const { assignmentId, answers = [], autoSubmit = false } = req.body;
    const assignment = await findAccessibleAssignmentForStudent(assignmentId, req.user);
    const now = new Date();

    if (!autoSubmit && now > assignment.endTime) {
      return res.status(403).json({ message: 'Submission time has ended. Only auto-submit is accepted after endTime.' });
    }

    if (now < assignment.startTime) {
      return res.status(403).json({ message: 'Assignment has not started yet.' });
    }

    const submission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: req.user._id,
    });

    if (!submission) {
      return res.status(404).json({ message: 'Start the assignment before submitting.' });
    }

    if (submission.status !== 'in-progress') {
      return res.status(409).json({ message: 'This assignment has already been submitted.' });
    }

    submission.answers = normalizeAnswers(assignment, answers);
    submission.status = autoSubmit ? 'auto-submitted' : 'submitted';
    submission.submittedAt = now;
    await submission.save();

    return res.json({ message: 'Assignment submitted successfully.', submission });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to submit assignment.' });
  }
});

router.get('/:assignmentId', roleMiddleware(['teacher']), async (req, res) => {
  try {
    const assignment = await assertTeacherOwnsAssignment(req.params.assignmentId, req.user._id);
    const submissions = await Submission.find({ assignmentId: assignment._id })
      .populate('studentId', 'name email rollNumber')
      .sort({ submittedAt: -1, startedAt: -1 });

    return res.json({ assignment, submissions });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch submissions.' });
  }
});

router.put('/evaluate', roleMiddleware(['teacher']), async (req, res) => {
  try {
    const { submissionId, evaluations = [] } = req.body;
    if (!isObjectId(submissionId)) {
      return res.status(400).json({ message: 'A valid submissionId is required.' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (submission.status === 'in-progress') {
      return res.status(400).json({ message: 'Cannot evaluate an in-progress submission.' });
    }

    const assignment = await assertTeacherOwnsAssignment(submission.assignmentId, req.user._id);
    const evaluationMap = new Map(evaluations.map((item) => [item.questionId?.toString(), item]));

    submission.answers = submission.answers.map((answer) => {
      const evaluation = evaluationMap.get(answer.questionId.toString());
      if (!evaluation) {
        return answer;
      }

      const marksAwarded = Number(evaluation.marksAwarded);
      if (!Number.isFinite(marksAwarded) || marksAwarded < 0 || marksAwarded > assignment.marksPerQuestion) {
        const error = new Error(`Marks for each question must be between 0 and ${formatMarks(assignment.marksPerQuestion)}.`);
        error.statusCode = 400;
        throw error;
      }

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        marksAwarded,
        feedback: evaluation.feedback || '',
      };
    });

    submission.totalMarks = submission.answers.reduce((sum, answer) => sum + Number(answer.marksAwarded || 0), 0);
    submission.evaluatedAt = new Date();
    submission.evaluatedBy = req.user._id;
    await submission.save();

    return res.json({ message: 'Submission evaluated successfully.', submission });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to evaluate submission.' });
  }
});

module.exports = router;
