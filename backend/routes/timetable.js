const express = require('express');
const mongoose = require('mongoose');

const Timetable = require('../models/Timetable');
const PeriodAttendance = require('../models/PeriodAttendance');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const VALID_STATUSES = ['present', 'absent', 'late'];

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getSchoolId = (user) => user.school || user.schoolId;

const normalizeDay = (value) => {
  const date = value ? new Date(value) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const dayNameFromDate = (value) => DAYS[normalizeDay(value).getDay()];

const buildHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureClassAccess = async (user, classId) => {
  if (!isObjectId(classId)) {
    throw buildHttpError('A valid classId is required.', 400);
  }

  const classroom = await Class.findById(classId);
  if (!classroom) {
    throw buildHttpError('Class not found.', 404);
  }

  const userSchoolId = getSchoolId(user);
  const classSchoolId = classroom.school || classroom.schoolId;

  if (user.role !== 'super_admin' && userSchoolId?.toString() !== classSchoolId?.toString()) {
    throw buildHttpError('You do not have access to this class.', 403);
  }

  if (user.role === 'student') {
    const studentClassId = user.class || user.classId;
    if (!studentClassId || studentClassId.toString() !== classroom._id.toString()) {
      throw buildHttpError('Students can only view their own class timetable.', 403);
    }
  }

  return classroom;
};

const populatePeriodQuery = (query) =>
  query
    .populate('classId', 'name section academicYear')
    .populate('subjectId', 'name')
    .populate('teacherId', 'name email');

const getPeriodOrThrow = async (periodId) => {
  if (!isObjectId(periodId)) {
    throw buildHttpError('A valid periodId is required.', 400);
  }

  const period = await populatePeriodQuery(Timetable.findById(periodId));
  if (!period || !period.isActive) {
    throw buildHttpError('Timetable period not found.', 404);
  }

  return period;
};

const ensurePeriodAccess = async (user, period, action = 'view') => {
  await ensureClassAccess(user, period.classId?._id || period.classId);

  if (user.role === 'teacher' && period.teacherId?._id?.toString() !== user._id.toString() && period.teacherId?.toString() !== user._id.toString()) {
    throw buildHttpError(action === 'mark' ? 'Teachers can only take attendance for their assigned period.' : 'You can only view your assigned periods.', 403);
  }
};

const getClassTimetable = async (req, res) => {
  try {
    await ensureClassAccess(req.user, req.params.classId);
    const periods = await populatePeriodQuery(
      Timetable.find({ classId: req.params.classId, isActive: true }).sort({ dayOfWeek: 1, periodNumber: 1 })
    );
    return res.json({ periods });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch timetable.' });
  }
};

const getMyTimetable = async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.user.role === 'teacher') {
      query.teacherId = req.user._id;
    } else if (req.user.role === 'student') {
      const classId = req.user.class || req.user.classId;
      if (!classId) return res.json({ periods: [] });
      query.classId = classId;
    } else {
      return res.status(403).json({ message: 'Only teachers and students can use this endpoint.' });
    }

    const periods = await populatePeriodQuery(Timetable.find(query).sort({ dayOfWeek: 1, periodNumber: 1 }));
    return res.json({ periods });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch timetable.' });
  }
};

const getTodayTeacherPeriods = async (req, res) => {
  try {
    const date = normalizeDay(req.query.date);
    const periods = await populatePeriodQuery(
      Timetable.find({
        teacherId: req.user._id,
        dayOfWeek: dayNameFromDate(date),
        isActive: true,
      }).sort({ startTime: 1, periodNumber: 1 })
    );

    return res.json({ date, periods });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch today periods.' });
  }
};

const upsertPeriod = async (req, res) => {
  try {
    const { classId, dayOfWeek, periodNumber, subjectId, teacherId, startTime, endTime } = req.body;
    const classroom = await ensureClassAccess(req.user, classId);

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins can manage timetable periods.' });
    }

    if (!DAYS.includes(dayOfWeek)) {
      return res.status(400).json({ message: 'A valid dayOfWeek is required.' });
    }

    if (!isObjectId(subjectId) || !isObjectId(teacherId)) {
      return res.status(400).json({ message: 'A valid subjectId and teacherId are required.' });
    }

    const schoolId = classroom.school || classroom.schoolId;
    const [subject, teacher] = await Promise.all([
      Subject.findOne({ _id: subjectId, schoolId }),
      User.findOne({ _id: teacherId, role: 'teacher', school: schoolId }),
    ]);

    if (!subject) return res.status(404).json({ message: 'Subject not found for this school.' });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found for this school.' });

    const period = await Timetable.findOneAndUpdate(
      { classId: classroom._id, dayOfWeek, periodNumber: Number(periodNumber) },
      {
        classId: classroom._id,
        schoolId,
        dayOfWeek,
        periodNumber: Number(periodNumber),
        subjectId,
        teacherId,
        startTime,
        endTime,
        isActive: true,
      },
      { new: true, upsert: true, runValidators: true }
    );

    await period.populate('classId', 'name section academicYear');
    await period.populate('subjectId', 'name');
    await period.populate('teacherId', 'name email');

    return res.status(201).json({ message: 'Timetable period saved.', period });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to save timetable period.' });
  }
};

const deletePeriod = async (req, res) => {
  try {
    const period = await getPeriodOrThrow(req.params.periodId);
    await ensureClassAccess(req.user, period.classId?._id || period.classId);

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins can delete timetable periods.' });
    }

    period.isActive = false;
    await period.save();
    return res.json({ message: 'Timetable period removed.' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to delete timetable period.' });
  }
};

const getPeriodAttendance = async (req, res) => {
  try {
    const period = await getPeriodOrThrow(req.params.periodId);
    await ensurePeriodAccess(req.user, period, 'mark');
    const date = normalizeDay(req.query.date);

    if (period.dayOfWeek !== dayNameFromDate(date)) {
      return res.status(400).json({ message: 'Selected period does not belong to this date.' });
    }

    const [students, records] = await Promise.all([
      User.find({
        role: 'student',
        school: period.schoolId,
        $or: [{ class: period.classId._id || period.classId }, { classId: period.classId._id || period.classId }],
      }).select('name email rollNumber').sort({ name: 1 }),
      PeriodAttendance.find({ timetablePeriodId: period._id, date }).populate('studentId', 'name email rollNumber'),
    ]);

    return res.json({ period, date, students, records });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch period attendance.' });
  }
};

const markPeriodAttendance = async (req, res) => {
  try {
    const period = await getPeriodOrThrow(req.params.periodId);
    await ensurePeriodAccess(req.user, period, 'mark');

    const date = normalizeDay(req.body.date);
    const today = normalizeDay(new Date());

    if (period.dayOfWeek !== dayNameFromDate(date)) {
      return res.status(400).json({ message: 'Selected period does not belong to this date.' });
    }

    if (req.user.role === 'teacher' && date.getTime() !== today.getTime()) {
      return res.status(403).json({ message: 'Teachers can only take period attendance for today.' });
    }

    if (!Array.isArray(req.body.students) || req.body.students.length === 0) {
      return res.status(400).json({ message: 'students array is required.' });
    }

    const classId = period.classId._id || period.classId;
    const schoolId = period.schoolId;
    const studentIds = req.body.students.map((student) => student.studentId);
    const validStudents = await User.countDocuments({
      _id: { $in: studentIds },
      role: 'student',
      school: schoolId,
      $or: [{ class: classId }, { classId }],
    });

    if (validStudents !== req.body.students.length) {
      return res.status(400).json({ message: 'Some students do not belong to this class.' });
    }

    const operations = req.body.students.map((student) => {
      if (!VALID_STATUSES.includes(student.status)) {
        throw buildHttpError('Status must be present, absent, or late.', 400);
      }

      return {
        updateOne: {
          filter: { timetablePeriodId: period._id, studentId: student.studentId, date },
          update: {
            timetablePeriodId: period._id,
            classId,
            schoolId,
            subjectId: period.subjectId._id || period.subjectId,
            teacherId: period.teacherId._id || period.teacherId,
            studentId: student.studentId,
            date,
            status: student.status,
            markedBy: req.user._id,
            markedAt: new Date(),
          },
          upsert: true,
        },
      };
    });

    await PeriodAttendance.bulkWrite(operations);
    const records = await PeriodAttendance.find({ timetablePeriodId: period._id, date }).populate('studentId', 'name email rollNumber');
    return res.status(201).json({ message: 'Period attendance saved.', period, records });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to mark period attendance.' });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());
    const targetStudentId = req.user.role === 'student' ? req.user._id : req.query.studentId;

    if (!isObjectId(targetStudentId)) {
      return res.status(400).json({ message: 'A valid studentId is required.' });
    }

    const student = await User.findOne({ _id: targetStudentId, role: 'student' }).populate('class', 'name section');
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    if (req.user.role === 'student' && student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Students can only view their own attendance.' });
    }

    await ensureClassAccess(req.user, student.class || student.classId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const records = await PeriodAttendance.find({
      studentId: student._id,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('subjectId', 'name')
      .populate('timetablePeriodId', 'dayOfWeek periodNumber startTime endTime')
      .sort({ date: 1 });

    const totalMarkedPeriods = records.length;
    const attendedPeriods = records.filter((record) => ['present', 'late'].includes(record.status)).length;
    const absentPeriods = records.filter((record) => record.status === 'absent').length;

    const subjectMap = new Map();
    const dailyMap = new Map();

    records.forEach((record) => {
      const subjectId = record.subjectId?._id?.toString() || record.subjectId?.toString();
      const subject = subjectMap.get(subjectId) || {
        subjectId,
        subjectName: record.subjectId?.name || 'Subject',
        total: 0,
        attended: 0,
        absent: 0,
        percentage: 0,
      };
      subject.total += 1;
      if (['present', 'late'].includes(record.status)) subject.attended += 1;
      if (record.status === 'absent') subject.absent += 1;
      subject.percentage = subject.total ? Math.round((subject.attended / subject.total) * 100) : 0;
      subjectMap.set(subjectId, subject);

      const dayKey = record.date.toISOString().split('T')[0];
      const daily = dailyMap.get(dayKey) || { date: dayKey, total: 0, attended: 0, absent: 0, percentage: 0 };
      daily.total += 1;
      if (['present', 'late'].includes(record.status)) daily.attended += 1;
      if (record.status === 'absent') daily.absent += 1;
      daily.percentage = daily.total ? Math.round((daily.attended / daily.total) * 100) : 0;
      dailyMap.set(dayKey, daily);
    });

    return res.json({
      student,
      month,
      year,
      summary: {
        totalMarkedPeriods,
        attendedPeriods,
        absentPeriods,
        percentage: totalMarkedPeriods ? Math.round((attendedPeriods / totalMarkedPeriods) * 100) : 0,
      },
      subjectWise: Array.from(subjectMap.values()),
      daily: Array.from(dailyMap.values()),
      records,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch attendance summary.' });
  }
};

router.get('/my', roleMiddleware(['teacher', 'student']), getMyTimetable);
router.get('/teacher/today', roleMiddleware(['teacher']), getTodayTeacherPeriods);
router.get('/attendance/summary', roleMiddleware(['student', 'teacher', 'admin', 'super_admin']), getAttendanceSummary);
router.get('/classes/:classId', roleMiddleware(['student', 'teacher', 'admin', 'super_admin']), getClassTimetable);
router.post('/periods', roleMiddleware(['admin', 'super_admin']), upsertPeriod);
router.delete('/periods/:periodId', roleMiddleware(['admin', 'super_admin']), deletePeriod);
router.get('/periods/:periodId/attendance', roleMiddleware(['teacher', 'admin', 'super_admin']), getPeriodAttendance);
router.post('/periods/:periodId/attendance', roleMiddleware(['teacher', 'admin', 'super_admin']), markPeriodAttendance);

module.exports = router;
