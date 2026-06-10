const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const mongoose = require('mongoose');

const Attendance = require('../models/Attendance');
const AttendanceConfig = require('../models/AttendanceConfig');

const Class = require('../models/Class');
const User = require('../models/User');
const School = require('../models/School');
const { saveAttendanceImage } = require('../utils/attendanceImageStorage');

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const VALID_ATTENDANCE_STATUS = ['present', 'absent', 'late'];
const VALID_ATTENDANCE_METHODS = ['manual', 'camera'];

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getSchoolIdFromUser = (user) => {
  const school = user.school || user.schoolId;
  return school?._id || school;
};

const normalizeDay = (value) => {
  const date = value ? new Date(value) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) {
    return null;
  }

  if (timeValue instanceof Date) {
    return timeValue;
  }

  if (typeof timeValue === 'string' && timeValue.includes('T')) {
    return new Date(timeValue);
  }

  return new Date(`${dateValue}T${timeValue}:00`);
};

const buildHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getClassOrThrow = async (classId, schoolId) => {
  const query = { _id: classId };
  if (schoolId) {
    query.school = schoolId;
  }

  const classroom = await Class.findOne(query).populate('classTeacher', 'name email');
  if (!classroom) {
    throw buildHttpError('Class not found.', 404);
  }

  return classroom;
};

const validateClassAccess = async ({ user, classId, allowTeacherOwnership = true }) => {
  if (!isObjectId(classId)) {
    throw buildHttpError('A valid classId is required.', 400);
  }

  const userSchoolId = getSchoolIdFromUser(user);
  const classroom = await getClassOrThrow(classId, (user.role === 'super_admin' || user.role === 'admin') ? null : userSchoolId);

  // Super Admin and Admin have full access (if within school for Admin)
  if (user.role === 'super_admin') return classroom;
  if (user.role === 'admin') {
    if (userSchoolId && (classroom.school || classroom.schoolId)?.toString() !== userSchoolId.toString()) {
      throw buildHttpError('You do not have access to attendance outside your school.', 403);
    }
    return classroom;
  }

  if (user.role === 'student') {
    if (!user.class || user.class.toString() !== classId.toString()) {
      throw buildHttpError('Students can only access attendance for their assigned class.', 403);
    }
  }

  if (user.role === 'teacher' && allowTeacherOwnership) {
    if (!classroom.classTeacher || classroom.classTeacher._id.toString() !== user._id.toString()) {
      throw buildHttpError('Teachers can only manage attendance for classes they own.', 403);
    }
  }

  if (
    ['teacher', 'student'].includes(user.role) &&
    userSchoolId &&
    (classroom.school || classroom.schoolId)?.toString() !== userSchoolId.toString()
  ) {
    throw buildHttpError('You do not have access to attendance outside your school.', 403);
  }

  return classroom;
};

const validateStudentForClass = async ({ studentId, classroom, user }) => {
  if (!isObjectId(studentId)) {
    throw buildHttpError('A valid studentId is required.', 400);
  }

  const student = await User.findOne({
    _id: studentId,
    role: 'student',
    school: classroom.school || classroom.schoolId,
  }).select('name email class school');

  if (!student) {
    throw buildHttpError('Student not found.', 404);
  }

  if (!student.class || student.class.toString() !== classroom._id.toString()) {
    throw buildHttpError('Student is not assigned to the selected class.', 400);
  }

  if (user.role === 'student' && student._id.toString() !== user._id.toString()) {
    throw buildHttpError('Students can only mark their own attendance.', 403);
  }

  return student;
};

const emitAttendanceEvent = (req, event, payload, classId, schoolId) => {
  const socketService = req.app.locals.socketService;
  if (!socketService) {
    return;
  }

  socketService.emitAttendanceEvent({
    event,
    payload,
    classId: classId?.toString(),
    schoolId: schoolId?.toString(),
  });
};

const markAttendance = async (req, res) => {
  try {
    const { classId, studentId, status, method = 'manual', imageData, date } = req.body;

    console.log('=== MARK ATTENDANCE DEBUG ===');
    console.log('Request body:', { classId, studentId, status, method, date });
    console.log('User:', { id: req.user._id, email: req.user.email, role: req.user.role });

    if (!VALID_ATTENDANCE_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Attendance status must be present, absent, or late.' });
    }

    if (!VALID_ATTENDANCE_METHODS.includes(method)) {
      return res.status(400).json({ message: 'Attendance method must be manual or camera.' });
    }

    const classroom = await validateClassAccess({
      user: req.user,
      classId,
      allowTeacherOwnership: req.user.role !== 'student',
    });

    const targetDate = date ? normalizeDay(new Date(date)) : normalizeDay(new Date());
    const today = normalizeDay(new Date());

    // Teacher and Student restriction: Only current day
    if (['teacher', 'student'].includes(req.user.role) && targetDate.getTime() !== today.getTime()) {
      return res.status(403).json({ message: `${req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)}s can only mark attendance for the current day.` });
    }

    const targetStudentId = req.user.role === 'student' ? req.user._id : studentId;
    const student = await validateStudentForClass({ studentId: targetStudentId, classroom, user: req.user });

    console.log('Processed data:', {
      targetDate: targetDate.toISOString(),
      targetStudentId,
      studentId: student._id,
      classId: classroom._id
    });

    // Check if attendance already exists for this student on this date
    let existingAttendance = await Attendance.findOne({
      studentId: student._id,
      classId: classroom._id,
      date: targetDate
    });

    console.log('Existing attendance check:', existingAttendance ? 'FOUND' : 'NOT FOUND');
    if (existingAttendance) {
      console.log('Existing attendance:', {
        id: existingAttendance._id,
        date: existingAttendance.date.toISOString(),
        status: existingAttendance.status
      });
      existingAttendance.status = status;
      existingAttendance.markedAt = new Date();
      existingAttendance.markedBy = req.user._id;
      existingAttendance.method = method;
      await existingAttendance.save();
      await existingAttendance.populate('studentId', 'name email rollNumber');
      return res.status(200).json({
        message: 'Attendance updated successfully.',
        attendance: existingAttendance,
      });
    }

    let imageUrl = null;
    if (method === 'camera') {
      if (!imageData) {
        return res.status(400).json({ message: 'Camera attendance requires an image payload.' });
      }

      imageUrl = await saveAttendanceImage({
        imageData,
        studentId: student._id.toString(),
        date: targetDate.toISOString(),
      });
    }

    const attendance = await Attendance.findOneAndUpdate(
      {
        studentId: student._id,
        classId: classroom._id,
        date: targetDate
      },
      {
        studentId: student._id,
        classId: classroom._id,
        schoolId: classroom.schoolId || classroom.school,
        date: targetDate,
        status,
        markedAt: new Date(),
        markedBy: req.user._id,
        method,
        imageUrl,
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    await attendance.populate('studentId', 'name email rollNumber');

    const payload = {
      attendance,
      classId: classroom._id,
      schoolId: classroom.schoolId,
    };

    emitAttendanceEvent(req, 'attendance-marked', payload, classroom._id, classroom.schoolId);

    return res.status(201).json({
      message: 'Attendance marked successfully.',
      attendance,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to mark attendance.' });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const targetStudentId = req.user.role === 'student' ? req.user._id.toString() : req.query.studentId;
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());

    if (!targetStudentId || !isObjectId(targetStudentId)) {
      return res.status(400).json({ message: 'A valid studentId is required.' });
    }

    const student = await User.findById(targetStudentId).populate('class', 'name section academicYear');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (req.user.role === 'student' && student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Students can only view their own attendance.' });
    }

    if (req.user.role === 'teacher') {
      await validateClassAccess({ user: req.user, classId: student.class?._id || student.class });
    }

    if (req.user.role === 'admin' && req.user.school && student.school?.toString() !== req.user.school.toString()) {
      return res.status(403).json({ message: 'You can only view attendance for students in your school.' });
    }

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      studentId: student._id,
      date: { $gte: monthStart, $lte: monthEnd },
    })
      .populate('classId', 'name section academicYear')
      .sort({ date: 1 });

    const summary = records.reduce(
      (accumulator, record) => {
        accumulator.total += 1;
        accumulator[record.status] += 1;
        return accumulator;
      },
      { total: 0, present: 0, absent: 0, late: 0 }
    );

    return res.json({
      student: {
        _id: student._id,
        name: student.name,
        class: student.class,
      },
      month,
      year,
      records,
      summary,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch student attendance.' });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const { month, year, date, classId, studentId: queryStudentId } = req.query;
    
    let startDate, endDate;
    
    if (date) {
      startDate = normalizeDay(date);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const m = Number(month || new Date().getMonth() + 1);
      const y = Number(year || new Date().getFullYear());
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 0, 23, 59, 59, 999);
    }

    const reportQuery = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (req.user.role === 'student') {
      reportQuery.studentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      const userSchoolId = getSchoolIdFromUser(req.user);
      const teacherClasses = await Class.find({
        classTeacher: req.user._id,
        school: userSchoolId,
      }).select('_id');
      
      const teacherClassIds = teacherClasses.map((item) => item._id.toString());
      
      if (classId) {
        if (!teacherClassIds.includes(classId.toString())) {
          return res.status(403).json({ message: 'Teachers can only view reports for their assigned classes.' });
        }
        reportQuery.classId = classId;
      } else {
        reportQuery.classId = { $in: teacherClasses.map((item) => item._id) };
      }

      if (queryStudentId) {
        reportQuery.studentId = queryStudentId;
      }
    } else if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      const userSchoolId = getSchoolIdFromUser(req.user);
      if (req.user.role === 'admin' && userSchoolId) {
        const schoolClasses = await Class.find({ school: userSchoolId }).select('_id');
        const schoolClassIds = schoolClasses.map(c => c._id.toString());
        
        if (classId) {
          if (!schoolClassIds.includes(classId.toString())) {
            return res.status(403).json({ message: 'Admins can only view reports for their school classes.' });
          }
          reportQuery.classId = classId;
        } else {
          reportQuery.classId = { $in: schoolClasses.map((item) => item._id) };
        }
      } else if (classId) {
        reportQuery.classId = classId;
      }

      if (queryStudentId) {
        reportQuery.studentId = queryStudentId;
      }
    }

    const records = await Attendance.find(reportQuery)
      .populate('studentId', 'name rollNumber')
      .populate('classId', 'name section academicYear')
      .sort({ date: 1, markedAt: 1 });

    // Handle export format if requested
    const { format } = req.query;
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance Report');

      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Student Name', key: 'student', width: 25 },
        { header: 'Roll Number', key: 'roll', width: 15 },
        { header: 'Class', key: 'class', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Method', key: 'method', width: 12 },
        { header: 'Marked At', key: 'markedAt', width: 20 }
      ];

      records.forEach(record => {
        worksheet.addRow({
          date: record.date.toISOString().split('T')[0],
          student: record.studentId?.name || 'N/A',
          roll: record.studentId?.rollNumber || 'N/A',
          class: `${record.classId?.name || 'N/A'} - ${record.classId?.section || ''}`,
          status: record.status.toUpperCase(),
          method: record.method,
          markedAt: record.markedAt ? new Date(record.markedAt).toLocaleString() : 'N/A'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${new Date().getTime()}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${new Date().getTime()}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Attendance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Report Generated On: ${new Date().toLocaleString()}`);
      doc.moveDown();

      records.forEach((record, index) => {
        doc.fontSize(10).text(`${index + 1}. Date: ${record.date.toISOString().split('T')[0]} | Student: ${record.studentId?.name || 'N/A'} | Status: ${record.status.toUpperCase()}`);
        if (index % 25 === 0 && index !== 0) doc.addPage();
      });

      doc.end();
      return;
    }

    const groupedByDay = records.reduce((accumulator, record) => {
      const dayKey = record.date.toISOString().split('T')[0];
      if (!accumulator[dayKey]) {
        accumulator[dayKey] = [];
      }
      accumulator[dayKey].push(record);
      return accumulator;
    }, {});

    const events = Object.entries(groupedByDay).map(([dayKey, dayRecords]) => ({
      date: dayKey,
      statuses: dayRecords.map((record) => ({
        id: record._id,
        studentId: record.studentId,
        classId: record.classId,
        status: record.status,
        method: record.method,
        markedAt: record.markedAt,
      })),
      counts: dayRecords.reduce(
        (accumulator, record) => {
          accumulator.total += 1;
          accumulator[record.status] += 1;
          return accumulator;
        },
        { total: 0, present: 0, absent: 0, late: 0 }
      ),
    }));

    return res.json({
      month,
      year,
      filters: { classId: classId || null },
      events,
      records,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch attendance report.' });
  }
};

const getAccessibleClasses = async (req, res) => {
  try {
    let classes = [];

    if (req.user.role === 'student') {
      classes = await Class.find({ _id: req.user.class, school: req.user.school })
        .populate('classTeacher', 'name email')
        .sort({ name: 1, section: 1 });
    } else if (req.user.role === 'teacher') {
      classes = await Class.find({ classTeacher: req.user._id, school: req.user.school })
        .populate('classTeacher', 'name email')
        .sort({ name: 1, section: 1 });
    } else if (req.user.role === 'super_admin') {
      classes = await Class.find({})
        .populate('classTeacher', 'name email')
        .sort({ name: 1, section: 1 });
    } else {
      classes = await Class.find({ school: req.user.school })
        .populate('classTeacher', 'name email')
        .sort({ name: 1, section: 1 });
    }

    return res.json(classes);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch accessible classes.' });
  }
};

const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.query;
    const classroom = await validateClassAccess({ user: req.user, classId });

    const students = await User.find({
      role: 'student',
      class: classroom._id,
      school: classroom.school || classroom.schoolId,
    })
      .select('name email rollNumber class')
      .sort({ name: 1 });

    return res.json({ students });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch class students.' });
  }
};

// ==================== ATTENDANCE CONFIG MANAGEMENT ====================

const getAttendanceConfig = async (req, res) => {
  try {
    const schoolId = req.user.role === 'super_admin' ? req.query.schoolId : req.user.school;

    if (!schoolId || !isObjectId(schoolId)) {
      return res.status(400).json({ message: 'A valid schoolId is required.' });
    }

    const config = await AttendanceConfig.findOne({ schoolId })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!config) {
      // Return default config if not set
      return res.json({
        config: {
          schoolId,
          startTime: '08:00',
          endTime: '12:00',
          isActive: true,
          message: 'No custom configuration found. Default settings are displayed.',
        },
      });
    }

    return res.json({ config });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch attendance configuration.' });
  }
};

const createOrUpdateAttendanceConfig = async (req, res) => {
  try {
    const { schoolId, startTime, endTime, isActive } = req.body;

    if (!schoolId || !isObjectId(schoolId)) {
      return res.status(400).json({ message: 'A valid schoolId is required.' });
    }

    // Admins can only manage their own school
    if (req.user.role === 'admin' && req.user.school?.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: 'You can only manage attendance configuration for your school.' });
    }

    // Validate time format
    if (!startTime || !startTime.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
      return res.status(400).json({ message: 'Start time must be in HH:mm format (e.g., 08:00).' });
    }

    if (!endTime || !endTime.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
      return res.status(400).json({ message: 'End time must be in HH:mm format (e.g., 12:00).' });
    }

    // Validate time order
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;

    if (startInMinutes >= endInMinutes) {
      return res.status(400).json({ message: 'Start time must be before end time.' });
    }

    // Check if school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found.' });
    }

    // Find existing config or create new one
    let config = await AttendanceConfig.findOne({ schoolId });

    if (config) {
      // Update existing config
      config.startTime = startTime;
      config.endTime = endTime;
      config.isActive = isActive !== undefined ? isActive : true;
      config.updatedBy = req.user._id;
      await config.save();
      await config.populate('createdBy', 'name email');
      await config.populate('updatedBy', 'name email');

      return res.json({
        message: 'Attendance configuration updated successfully.',
        config,
      });
    } else {
      // Create new config
      config = await AttendanceConfig.create({
        schoolId,
        startTime,
        endTime,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user._id,
      });

      await config.populate('createdBy', 'name email');

      return res.status(201).json({
        message: 'Attendance configuration created successfully.',
        config,
      });
    }
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to manage attendance configuration.' });
  }
};

const toggleAttendanceConfig = async (req, res) => {
  try {
    const { schoolId } = req.body;

    if (!schoolId || !isObjectId(schoolId)) {
      return res.status(400).json({ message: 'A valid schoolId is required.' });
    }

    // Admins can only manage their own school
    if (req.user.role === 'admin' && req.user.school?.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: 'You can only manage attendance configuration for your school.' });
    }

    const config = await AttendanceConfig.findOne({ schoolId });
    if (!config) {
      return res.status(404).json({ message: 'Attendance configuration not found for this school.' });
    }

    config.isActive = !config.isActive;
    config.updatedBy = req.user._id;
    await config.save();
    await config.populate('createdBy', 'name email');
    await config.populate('updatedBy', 'name email');

    return res.json({
      message: `Attendance system ${config.isActive ? 'enabled' : 'disabled'} successfully.`,
      config,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to toggle attendance configuration.' });
  }
};

const getAdminAttendanceStats = async (req, res) => {
  try {
    const schoolId = req.user.role === 'super_admin' ? req.query.schoolId : getSchoolIdFromUser(req.user);
    
    const { date } = req.query;
    
    const targetDate = date ? normalizeDay(new Date(date)) : normalizeDay(new Date());

    // Get total classes - handle case where schoolId might be null
    const classFilter = schoolId ? { school: schoolId, status: 'active' } : { status: 'active' };
    const totalClasses = await Class.countDocuments(classFilter);

    // Get total students - handle case where schoolId might be null
    const studentFilter = schoolId ? { role: 'student', school: schoolId } : { role: 'student' };
    const totalStudents = await User.countDocuments(studentFilter);

    // Get attendance stats for the date
    let classIds = [];
    if (schoolId) {
      classIds = await Class.find({ school: schoolId }).distinct('_id');
    } else {
      classIds = await Class.find({ status: 'active' }).distinct('_id');
    }

    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          date: targetDate,
          classId: { $in: classIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      present: 0,
      absent: 0,
      late: 0
    };

    attendanceStats.forEach(stat => {
      stats[stat._id] = stat.count;
    });

    // Get total marked attendance
    const totalMarked = stats.present + stats.absent + stats.late;

    return res.json({
      date: targetDate,
      totalClasses,
      totalStudents,
      totalPresent: stats.present,
      totalAbsent: stats.absent,
      totalLate: stats.late,
      totalMarked,
      unmarkedStudents: totalStudents - totalMarked
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch attendance statistics.' });
  }
};

const getAdminAttendanceCalendar = async (req, res) => {
  try {
    const schoolId = req.user.role === 'super_admin' ? req.query.schoolId : getSchoolIdFromUser(req.user);
    
    const { month, year } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get date range for the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get class IDs for the school
    let classIds = [];
    if (schoolId) {
      classIds = await Class.find({ school: schoolId, status: 'active' }).distinct('_id');
    } else {
      classIds = await Class.find({ status: 'active' }).distinct('_id');
    }

    // Get attendance data for the month
    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: normalizeDay(startDate),
            $lte: normalizeDay(endDate)
          },
          classId: { $in: classIds }
        }
      },
      {
        $group: {
          _id: '$date',
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Transform data for calendar
    const calendarEvents = attendanceData.map(item => ({
      date: item._id,
      counts: {
        present: item.present,
        absent: item.absent,
        late: item.late,
        total: item.total
      }
    }));

    return res.json({
      events: calendarEvents,
      month: targetMonth + 1,
      year: targetYear
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to fetch calendar data.' });
  }
};

const getClassAttendance = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const classroom = await validateClassAccess({ user: req.user, classId });
    const normalizedDate = normalizeDay(date);
    
    const records = await Attendance.find({
      classId: classroom._id,
      date: normalizedDate
    }).populate('studentId', 'name rollNumber email');

    const students = records.map(record => ({
      studentId: record.studentId._id,
      status: record.status
    }));

    return res.json({
      classId: classroom._id,
      schoolId: classroom.schoolId || classroom.school,
      date: normalizedDate,
      markedBy: records.length ? records[0].markedBy : req.user._id,
      students
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};


const markClassAttendance = async (req, res) => {
  try {
    const { classId, date, students } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'students array is required' });
    }

    const classroom = await validateClassAccess({ user: req.user, classId });
    const normalizedDate = normalizeDay(date);
    const today = normalizeDay(new Date());

    // Teacher restriction: Only current day
    if (req.user.role === 'teacher' && normalizedDate.getTime() !== today.getTime()) {
      return res.status(403).json({ message: 'Teachers can only mark attendance for the current day.' });
    }

    const schoolId = classroom.schoolId || classroom.school;

    // Validate all students - check if they belong to the class
    const studentIds = students.map(s => s.studentId);
    const validStudents = await User.countDocuments({
      _id: { $in: studentIds },
      role: 'student',
      $or: [
        { class: classroom._id },
        { classId: classroom._id }
      ]
    });
    
    if (validStudents !== students.length) {
      return res.status(400).json({ message: 'Some students are not valid for this class' });
    }

    // Bulk upsert attendance records
    const operations = students.map(({ studentId, status }) => ({
      updateOne: {
        filter: { 
          classId: classroom._id, 
          studentId, 
          date: normalizedDate 
        },
        update: {
          classId: classroom._id,
          schoolId,
          studentId,
          date: normalizedDate,
          status,
          markedAt: new Date(),
          markedBy: req.user._id,
          method: 'bulk'
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(operations);

    // Get updated attendance data properly
    const attendanceData = await Attendance.find({
      classId: classroom._id,
      date: normalizedDate
    }).populate('studentId', 'name email rollNumber');

    emitAttendanceEvent(req, 'attendance-class-marked', attendanceData, classroom._id, schoolId);

    return res.status(201).json({
      message: 'Class attendance marked successfully',
      result,
      attendance: attendanceData
    });
  } catch (error) {
    console.error('Error in markClassAttendance:', error);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Failed to mark class attendance' 
    });
  }
};

const updateClassAttendance = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const { students } = req.body;

    if (!Array.isArray(students)) {
      return res.status(400).json({ message: 'students array is required' });
    }

    const classroom = await validateClassAccess({ user: req.user, classId });
    const normalizedDate = normalizeDay(date);
    const today = normalizeDay(new Date());

    // Teacher restriction: Only same day
    if (req.user.role === 'teacher' && normalizedDate.getTime() !== today.getTime()) {
      return res.status(403).json({ message: 'Teachers can only update attendance for the current day.' });
    }

    // Delete existing for class/date, recreate (simple bulk replace)
    await Attendance.deleteMany({ classId: classroom._id, date: normalizedDate });

    // Create new
    const operations = students.map(({ studentId, status }) => ({
      insertOne: {
        document: {
          classId: classroom._id,
          schoolId: classroom.schoolId || classroom.school,
          date: normalizedDate,
          studentId,
          status,
          method: 'bulk-update',
          markedBy: req.user._id
        }
      }
    }));

    const result = await Attendance.bulkWrite(operations);

    const attendance = {
      classId: classroom._id,
      date: normalizedDate,
      markedBy: req.user._id,
      students: students.map(s => ({ studentId: s.studentId, status: s.status }))
    };

    const schoolId = classroom.schoolId || classroom.school;
    emitAttendanceEvent(req, 'attendance-class-updated', attendance, classroom._id, schoolId);

    return res.json({
      message: 'Class attendance updated successfully',
      result,
      attendance
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    
    if (!isObjectId(attendanceId)) {
      return res.status(400).json({ message: 'A valid attendanceId is required.' });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    // Only Admin and Super Admin can delete attendance
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only administrators can delete attendance records.' });
    }

    // Admin must be from the same school
    if (req.user.role === 'admin') {
      const userSchoolId = getSchoolIdFromUser(req.user);
      if (attendance.schoolId?.toString() !== userSchoolId?.toString()) {
        return res.status(403).json({ message: 'You can only delete attendance for your school.' });
      }
    }

    await attendance.deleteOne();

    return res.json({ message: 'Attendance record deleted successfully.' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to delete attendance record.' });
  }
};

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/classes',
  roleMiddleware(['student', 'teacher', 'admin', 'super_admin']),
  getAccessibleClasses
);
router.get(
  '/students',
  roleMiddleware(['teacher', 'admin', 'super_admin']),
  getClassStudents
);
router.delete(
  '/:attendanceId',
  roleMiddleware(['admin', 'super_admin']),
  deleteAttendance
);
router.post(
  '/mark',
  roleMiddleware(['student', 'teacher', 'admin', 'super_admin']),
  markAttendance
);
router.get(
  '/student',
  roleMiddleware(['student', 'teacher', 'admin', 'super_admin']),
  getStudentAttendance
);
router.get(
  '/report',
  roleMiddleware(['student', 'teacher', 'admin', 'super_admin']),
  getMonthlyReport
);
router.get(
  '/admin/stats',
  roleMiddleware(['admin', 'super_admin']),
  getAdminAttendanceStats
);
router.get(
  '/admin/calendar',
  roleMiddleware(['admin', 'super_admin']),
  getAdminAttendanceCalendar
);

router.get(
  '/class/:classId/date/:date',
  roleMiddleware(['teacher', 'admin', 'super_admin']),
  getClassAttendance
);
router.post(
  '/mark-class',
  roleMiddleware(['teacher', 'admin', 'super_admin']),
  markClassAttendance
);
router.put(
  '/class/:classId/date/:date',
  roleMiddleware(['teacher', 'admin', 'super_admin']),
  updateClassAttendance
);

router.get(
  '/config',
  roleMiddleware(['admin', 'super_admin']),
  getAttendanceConfig
);
router.post(
  '/config',
  roleMiddleware(['admin', 'super_admin']),
  createOrUpdateAttendanceConfig
);
router.patch(
  '/config/toggle',
  roleMiddleware(['admin', 'super_admin']),
  toggleAttendanceConfig
);

module.exports = router;
