import React, { useMemo } from 'react';
import {
  FaBookOpen,
  FaCalendarCheck,
  FaChartBar,
  FaChartLine,
  FaClipboardCheck,
  FaLayerGroup,
} from 'react-icons/fa';
import Loader from '../components/Loader';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useGetStudentSubjectsQuery } from '../redux/academicApi';
import { useGetAssignmentsQuery } from '../redux/assignmentApi';
import { useGetStudentAttendanceQuery } from '../redux/attendanceApi';
import { ROLES } from '../routes';

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));

const formatPercent = (value) => `${clamp(value)}%`;

const getSubjectName = (subjectAssignment) =>
  subjectAssignment?.subjectId?.name || subjectAssignment?.subject?.name || 'Subject';

const getTeacherId = (item) => {
  const teacher = item?.teacherId || item?.teacher;
  return typeof teacher === 'string' ? teacher : teacher?._id;
};

const getAssignmentScore = (assignment) => {
  const earned = Number(assignment?.submission?.totalMarks);
  const total = Number(assignment?.totalMarks);

  if (!Number.isFinite(earned) || !Number.isFinite(total) || total <= 0) {
    return null;
  }

  return (earned / total) * 100;
};

const buildMonthlyLabels = () => {
  const labels = [];
  const date = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const monthDate = new Date(date.getFullYear(), date.getMonth() - index, 1);
    labels.push({
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: monthDate.toLocaleDateString([], { month: 'short' }),
      month: monthDate.getMonth(),
      year: monthDate.getFullYear(),
    });
  }

  return labels;
};

const StatCard = ({ icon: Icon, label, value, detail, tone = 'primary' }) => {
  const toneClass = {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    info: 'bg-info-soft text-info',
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text">{value}</p>
        </div>
        <span className={`rounded-lg p-3 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-text-muted">{detail}</p>
    </div>
  );
};

const ProgressBar = ({ value, className = 'bg-primary' }) => (
  <div className="h-2 overflow-hidden rounded-full bg-card-alt">
    <div className={`h-full rounded-full ${className}`} style={{ width: `${clamp(value)}%` }} />
  </div>
);

const StudentAnalytics = () => {
  const { user } = useAuth();
  const now = new Date();

  const { data: assignments = [], isLoading: assignmentsLoading } = useGetAssignmentsQuery();
  const studentId = user?.id || user?._id;
  const { data: studentSubjects = [], isLoading: subjectsLoading } = useGetStudentSubjectsQuery();
  const { data: attendanceData, isLoading: attendanceLoading } = useGetStudentAttendanceQuery({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    studentId,
  });

  const analytics = useMemo(() => {
    const attendanceRecords = attendanceData?.records || attendanceData?.attendance || [];
    const attendanceSummary = attendanceData?.summary || attendanceRecords.reduce(
      (summary, record) => {
        summary.total += 1;
        summary[record.status] = (summary[record.status] || 0) + 1;
        return summary;
      },
      { total: 0, present: 0, late: 0, absent: 0 }
    );
    const attendedDays = (attendanceSummary.present || 0) + (attendanceSummary.late || 0);
    const attendancePercent = attendanceSummary.total > 0 ? (attendedDays / attendanceSummary.total) * 100 : 0;

    const submittedAssignments = assignments.filter((assignment) => assignment.submission);
    const evaluatedAssignments = submittedAssignments.filter((assignment) => getAssignmentScore(assignment) !== null);
    const assignmentPercent = evaluatedAssignments.length > 0
      ? evaluatedAssignments.reduce((total, assignment) => total + getAssignmentScore(assignment), 0) / evaluatedAssignments.length
      : 0;
    const completionPercent = assignments.length > 0 ? (submittedAssignments.length / assignments.length) * 100 : 0;
    const overallPercent = (attendancePercent * 0.4) + (assignmentPercent * 0.45) + (completionPercent * 0.15);

    const subjectRows = studentSubjects.map((subjectAssignment) => {
      const teacherId = getTeacherId(subjectAssignment);
      const relatedAssignments = assignments.filter((assignment) => {
        const assignmentTeacherId = getTeacherId(assignment);
        return teacherId && assignmentTeacherId && teacherId === assignmentTeacherId;
      });
      const subjectSubmitted = relatedAssignments.filter((assignment) => assignment.submission);
      const subjectEvaluated = subjectSubmitted.filter((assignment) => getAssignmentScore(assignment) !== null);
      const score = subjectEvaluated.length > 0
        ? subjectEvaluated.reduce((total, assignment) => total + getAssignmentScore(assignment), 0) / subjectEvaluated.length
        : 0;
      const lessons = Number(subjectAssignment.lessonCount || 0);
      const videos = Number(subjectAssignment.videoCount || 0);
      const notes = Number(subjectAssignment.noteCount || 0);
      const contentProgress = lessons + videos + notes > 0
        ? Math.min(100, ((subjectSubmitted.length + lessons) / (lessons + videos + notes)) * 100)
        : score;

      return {
        id: subjectAssignment._id,
        name: getSubjectName(subjectAssignment),
        teacher: subjectAssignment.teacherId?.name || subjectAssignment.teacher?.name || 'Teacher not assigned',
        assignmentScore: score,
        assignmentCount: relatedAssignments.length,
        submittedCount: subjectSubmitted.length,
        contentProgress,
      };
    });

    const monthlyLabels = buildMonthlyLabels();
    const monthlyProgress = monthlyLabels.map((monthItem) => {
      const monthAssignments = assignments.filter((assignment) => {
        const dateValue = assignment.submission?.submittedAt || assignment.endTime || assignment.createdAt;
        const date = dateValue ? new Date(dateValue) : null;
        return date && date.getMonth() === monthItem.month && date.getFullYear() === monthItem.year;
      });
      const monthEvaluated = monthAssignments.filter((assignment) => getAssignmentScore(assignment) !== null);
      const assignmentScore = monthEvaluated.length > 0
        ? monthEvaluated.reduce((total, assignment) => total + getAssignmentScore(assignment), 0) / monthEvaluated.length
        : 0;
      const isCurrentMonth = monthItem.month === now.getMonth() && monthItem.year === now.getFullYear();
      const score = isCurrentMonth
        ? (assignmentScore * 0.55) + (attendancePercent * 0.45)
        : assignmentScore;

      return { ...monthItem, score: clamp(score), assignments: monthAssignments.length };
    });

    const attendanceByStatus = [
      { label: 'Present', value: attendanceSummary.present || 0, color: 'bg-success' },
      { label: 'Late', value: attendanceSummary.late || 0, color: 'bg-warning' },
      { label: 'Absent', value: attendanceSummary.absent || 0, color: 'bg-danger' },
    ];

    return {
      attendancePercent,
      assignmentPercent,
      completionPercent,
      overallPercent,
      attendanceSummary,
      submittedAssignments,
      evaluatedAssignments,
      subjectRows,
      monthlyProgress,
      attendanceByStatus,
    };
  }, [assignments, attendanceData, now, studentSubjects]);

  const isLoading = assignmentsLoading || subjectsLoading || attendanceLoading;
  const graphPoints = analytics.monthlyProgress
    .map((item, index) => `${index * 20},${100 - item.score}`)
    .join(' ');

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text">Performance Analytics</h1>
          <p className="mt-1 text-text-muted">Attendance, assignments, subject performance, and monthly progress.</p>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={FaCalendarCheck}
                label="Attendance"
                value={formatPercent(analytics.attendancePercent)}
                detail={`${analytics.attendanceSummary.present || 0} present, ${analytics.attendanceSummary.late || 0} late this month`}
                tone="success"
              />
              <StatCard
                icon={FaClipboardCheck}
                label="Assignments"
                value={formatPercent(analytics.assignmentPercent)}
                detail={`${analytics.evaluatedAssignments.length} evaluated of ${analytics.submittedAssignments.length} submitted`}
                tone="primary"
              />
              <StatCard
                icon={FaLayerGroup}
                label="Overall"
                value={formatPercent(analytics.overallPercent)}
                detail={`${formatPercent(analytics.completionPercent)} assignment completion`}
                tone="info"
              />
              <StatCard
                icon={FaBookOpen}
                label="Subjects"
                value={analytics.subjectRows.length}
                detail="Subject-wise analytics below"
                tone="warning"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card xl:col-span-2">
                <div className="mb-5 flex items-center gap-3">
                  <span className="rounded-lg bg-primary-soft p-3 text-primary">
                    <FaChartLine className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-text">Monthly Progress</h2>
                    <p className="text-sm text-text-muted">Last six months based on evaluated work and current attendance.</p>
                  </div>
                </div>

                <div className="grid h-56 grid-cols-6 items-end gap-3">
                  {analytics.monthlyProgress.map((item) => (
                    <div key={item.key} className="flex h-full flex-col justify-end gap-2">
                      <div className="flex flex-1 items-end rounded-lg bg-card-alt px-2">
                        <div
                          className="w-full rounded-t-lg bg-primary transition-all"
                          style={{ height: `${Math.max(item.score, 6)}%` }}
                          title={`${item.label}: ${item.score}%`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text">{item.score}%</p>
                        <p className="text-xs text-text-muted">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <div className="mb-5 flex items-center gap-3">
                  <span className="rounded-lg bg-info-soft p-3 text-info">
                    <FaChartBar className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-text">Performance Graph</h2>
                    <p className="text-sm text-text-muted">Trend line for your recent scores.</p>
                  </div>
                </div>

                <svg viewBox="0 0 100 100" className="h-44 w-full overflow-visible" preserveAspectRatio="none">
                  <polyline
                    points="0,100 20,100 40,100 60,100 80,100 100,100"
                    fill="none"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                  <polyline
                    points={graphPoints}
                    fill="none"
                    stroke="rgb(var(--color-primary))"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />
                  {analytics.monthlyProgress.map((item, index) => (
                    <circle
                      key={item.key}
                      cx={index * 20}
                      cy={100 - item.score}
                      r="2.8"
                      fill="rgb(var(--color-card))"
                      stroke="rgb(var(--color-primary))"
                      strokeWidth="2"
                    />
                  ))}
                </svg>

                <div className="mt-4 space-y-3">
                  {analytics.attendanceByStatus.map((item) => {
                    const value = analytics.attendanceSummary.total > 0
                      ? (item.value / analytics.attendanceSummary.total) * 100
                      : 0;

                    return (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium text-text">{item.label}</span>
                          <span className="text-text-muted">{item.value} days</span>
                        </div>
                        <ProgressBar value={value} className={item.color} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-text">Subject-wise Analytics</h2>
                  <p className="text-sm text-text-muted">Scores are matched to subjects through assigned teachers where available.</p>
                </div>
              </div>

              {analytics.subjectRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-border text-sm text-text-muted">
                        <th className="pb-3 font-medium">Subject</th>
                        <th className="pb-3 font-medium">Teacher</th>
                        <th className="pb-3 font-medium">Assignments</th>
                        <th className="pb-3 font-medium">Assignment %</th>
                        <th className="pb-3 font-medium">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analytics.subjectRows.map((subject) => (
                        <tr key={subject.id}>
                          <td className="py-4">
                            <p className="font-semibold text-text">{subject.name}</p>
                          </td>
                          <td className="py-4 text-sm text-text-muted">{subject.teacher}</td>
                          <td className="py-4 text-sm text-text">
                            {subject.submittedCount}/{subject.assignmentCount}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="w-12 text-sm font-semibold text-text">{formatPercent(subject.assignmentScore)}</span>
                              <div className="w-32">
                                <ProgressBar value={subject.assignmentScore} className="bg-primary" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="w-12 text-sm font-semibold text-text">{formatPercent(subject.contentProgress)}</span>
                              <div className="w-32">
                                <ProgressBar value={subject.contentProgress} className="bg-success" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-card-alt p-8 text-center text-text-muted">
                  No subjects assigned yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentAnalytics;
