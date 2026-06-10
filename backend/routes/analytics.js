const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const School = require('../models/School');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Subject = require('../models/Subject');

const router = express.Router();

// Helper function to get school ID from user
const getSchoolId = (user) => user.school || user.schoolId;

// Teacher Analytics
const getTeacherAnalytics = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);

    // Get teacher's subjects
    const teacherSubjects = await Subject.find({
      teacher: req.user._id,
      schoolId: schoolId
    }).populate('classId', 'name section');

    // Class Performance - Average scores per class
    const classPerformance = [];
    for (const subject of teacherSubjects) {
      const submissions = await Submission.find({
        assignment: { $in: await Assignment.find({ subject: subject._id }).distinct('_id') }
      }).populate('assignment');

      if (submissions.length > 0) {
        const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
        const averageScore = Math.round(totalScore / submissions.length);

        classPerformance.push({
          className: `${subject.classId?.name || 'Unknown'} ${subject.classId?.section || ''}`.trim(),
          averageScore,
          totalStudents: subject.classId ? await User.countDocuments({
            role: 'student',
            class: subject.classId._id
          }) : 0
        });
      }
    }

    // Weak Students - Students with scores below 50%
    const weakStudents = [];
    const allSubmissions = await Submission.find({
      assignment: { $in: await Assignment.find({
        subject: { $in: teacherSubjects.map(s => s._id) }
      }).distinct('_id') }
    }).populate('student', 'name').populate('assignment', 'subject');

    const studentScores = {};
    allSubmissions.forEach(sub => {
      const studentId = sub.student._id.toString();
      if (!studentScores[studentId]) {
        studentScores[studentId] = {
          name: sub.student.name,
          scores: [],
          subjects: new Set()
        };
      }
      studentScores[studentId].scores.push(sub.score || 0);
      studentScores[studentId].subjects.add(sub.assignment.subject.toString());
    });

    Object.entries(studentScores).forEach(([studentId, data]) => {
      const averageScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      if (averageScore < 50) {
        weakStudents.push({
          name: data.name,
          class: 'N/A', // Would need to populate class info
          averageScore,
          subjects: Array.from(data.subjects)
        });
      }
    });

    // Assignment Statistics
    const assignments = await Assignment.find({
      subject: { $in: teacherSubjects.map(s => s._id) }
    });

    const submissions = await Submission.find({
      assignment: { $in: assignments.map(a => a._id) }
    });

    const assignmentStats = {
      totalAssignments: assignments.length,
      submitted: submissions.length,
      pending: assignments.length - submissions.length,
      averageScore: submissions.length > 0 ?
        Math.round(submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length) : 0,
      completionRate: assignments.length > 0 ?
        Math.round((submissions.length / assignments.length) * 100) : 0
    };

    // Attendance Reports - Monthly data
    const attendanceData = await Attendance.find({
      class: { $in: teacherSubjects.map(s => s.classId).filter(Boolean) }
    }).populate('student', 'school');

    // Filter by school
    const schoolAttendance = attendanceData.filter(att =>
      att.student && (att.student.school || att.student.schoolId)?.toString() === schoolId?.toString()
    );

    const monthlyAttendance = {};
    schoolAttendance.forEach(att => {
      const month = new Date(att.date).toLocaleString('default', { month: 'long' });
      if (!monthlyAttendance[month]) {
        monthlyAttendance[month] = { total: 0, present: 0 };
      }
      monthlyAttendance[month].total++;
      if (att.status === 'present') {
        monthlyAttendance[month].present++;
      }
    });

    const attendanceReports = Object.entries(monthlyAttendance).map(([month, data]) => ({
      month,
      attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));

    // Subject Performance
    const subjectPerformance = [];
    for (const subject of teacherSubjects) {
      const subjectSubmissions = await Submission.find({
        assignment: { $in: await Assignment.find({ subject: subject._id }).distinct('_id') }
      });

      const averageScore = subjectSubmissions.length > 0 ?
        Math.round(subjectSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / subjectSubmissions.length) : 0;

      const totalStudents = subject.classId ? await User.countDocuments({
        role: 'student',
        class: subject.classId._id
      }) : 0;

      subjectPerformance.push({
        subject: subject.title,
        averageScore,
        totalStudents
      });
    }

    res.json({
      classPerformance,
      weakStudents,
      assignmentStats,
      attendanceReports,
      subjectPerformance
    });

  } catch (error) {
    console.error('Error getting teacher analytics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin Analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('school', 'name');
    const schoolId = user.school?._id;

    // School-wide Analytics
    const totalStudents = await User.countDocuments({
      role: 'student',
      school: schoolId
    });

    const totalTeachers = await User.countDocuments({
      role: 'teacher',
      school: schoolId
    });

    const totalClasses = await Class.countDocuments({ school: schoolId });

    // Attendance Percentage
    const attendanceStats = await Attendance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $match: {
          'studentInfo.school': schoolId
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalRecords = attendanceStats.length > 0 ? attendanceStats[0].totalRecords : 0;
    const presentRecords = attendanceStats.length > 0 ? attendanceStats[0].presentRecords : 0;
    const averageAttendance = totalRecords === 0 ? 0 : Math.round((presentRecords / totalRecords) * 100);

    // Revenue calculation
    const totalRevenue = await Fee.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $match: {
          'studentInfo.school': schoolId,
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Top Classes - Based on attendance and performance
    const classes = await Class.find({ school: schoolId }).populate('teacher', 'name');

    const topClasses = [];
    for (const cls of classes.slice(0, 3)) { // Limit to top 3
      const classAttendance = await Attendance.find({ class: cls._id });
      const attendanceRate = classAttendance.length > 0 ?
        Math.round((classAttendance.filter(a => a.status === 'present').length / classAttendance.length) * 100) : 0;

      // Get average performance for this class
      const classSubjects = await Subject.find({ classId: cls._id });
      let totalScore = 0;
      let totalSubmissions = 0;

      for (const subject of classSubjects) {
        const submissions = await Submission.find({
          assignment: { $in: await Assignment.find({ subject: subject._id }).distinct('_id') }
        });
        totalScore += submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
        totalSubmissions += submissions.length;
      }

      const averageScore = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;

      topClasses.push({
        name: `${cls.name} ${cls.section}`,
        averageScore,
        attendance: attendanceRate,
        rank: topClasses.length + 1
      });
    }

    // Sort by average score
    topClasses.sort((a, b) => b.averageScore - a.averageScore);

    // Low-performing Classes
    const lowPerformingClasses = [];
    for (const cls of classes) {
      const classAttendance = await Attendance.find({ class: cls._id });
      const attendanceRate = classAttendance.length > 0 ?
        Math.round((classAttendance.filter(a => a.status === 'present').length / classAttendance.length) * 100) : 0;

      const classSubjects = await Subject.find({ classId: cls._id });
      let totalScore = 0;
      let totalSubmissions = 0;

      for (const subject of classSubjects) {
        const submissions = await Submission.find({
          assignment: { $in: await Assignment.find({ subject: subject._id }).distinct('_id') }
        });
        totalScore += submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
        totalSubmissions += submissions.length;
      }

      const averageScore = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;

      if (averageScore < 60 || attendanceRate < 70) {
        lowPerformingClasses.push({
          name: `${cls.name} ${cls.section}`,
          averageScore,
          attendance: attendanceRate,
          issues: averageScore < 60 ? 'Academic performance' : 'Low attendance'
        });
      }
    }

    // Attendance Trends - Monthly data for last 5 months
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    const attendanceTrends = await Attendance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $match: {
          'studentInfo.school': schoolId,
          date: { $gte: fiveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthlyTrends = attendanceTrends.map(item => {
      const monthName = new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' });
      const attendance = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
      return {
        month: monthName,
        attendance,
        target: 90 // Assuming 90% is the target
      };
    });

    const schoolWideAnalytics = {
      totalStudents,
      totalTeachers,
      totalClasses,
      averageAttendance,
      totalRevenue: revenue,
      activeSubjects: await Subject.countDocuments({ schoolId })
    };

    res.json({
      schoolWideAnalytics,
      topClasses,
      lowPerformingClasses,
      attendanceTrends: monthlyTrends
    });

  } catch (error) {
    console.error('Error getting admin analytics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Routes
router.get('/teacher', authMiddleware, roleMiddleware('teacher'), getTeacherAnalytics);
router.get('/admin', authMiddleware, roleMiddleware('admin'), getAdminAnalytics);

module.exports = router;
