import React, { useState, useEffect } from 'react';
import { useGetStudentLiveClassesQuery, useJoinLiveClassMutation, useGetStudentClassQuery, useGetStudentSubjectsQuery } from '../redux/academicApi';
import { useGetAssignmentsQuery } from '../redux/assignmentApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const StudentDashboard = () => {
  const { data: liveClasses, isLoading: liveClassesLoading, error: liveClassesError } = useGetStudentLiveClassesQuery();
  const { data: studentClass, isLoading: classLoading } = useGetStudentClassQuery();
  const { data: studentSubjects, isLoading: subjectsLoading } = useGetStudentSubjectsQuery();
  const { data: assignments = [] } = useGetAssignmentsQuery();
  const [joinLiveClass] = useJoinLiveClassMutation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleJoinClass = async (classId, meetingLink) => {
    try {
      await joinLiveClass(classId).unwrap();
      if (meetingLink) {
        window.open(meetingLink, '_blank');
      }
      setToast({ type: 'success', message: 'Successfully joined the live class!' });
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to join live class' });
    }
  };

  const formatTimeRemaining = (scheduledAt) => {
    const now = currentTime;
    const classTime = new Date(scheduledAt);
    const timeDiff = classTime - now;

    if (timeDiff <= 0) {
      return { text: 'Class Started', isLive: true };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    if (days > 0) {
      return { text: `${days}d ${hours}h ${minutes}m`, isLive: false };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m ${seconds}s`, isLive: false };
    } else if (minutes > 0) {
      return { text: `${minutes}m ${seconds}s`, isLive: false };
    } else {
      return { text: `${seconds}s`, isLive: false };
    }
  };

  const upcomingClasses = liveClasses?.filter(liveClass =>
    new Date(liveClass.scheduledAt) > currentTime
  ).slice(0, 3) || [];

  const recentCompletedClasses = liveClasses?.filter(liveClass =>
    new Date(liveClass.scheduledAt) <= currentTime
  ).slice(0, 3) || [];
  const activeAssignments = assignments.filter((assignment) => assignment.isActive && !assignment.submission).slice(0, 3);

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text">Student Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(ROUTES.STUDENT_SUBJECTS)}
              className="px-4 py-2 bg-success text-white rounded-md hover:bg-success hover:opacity-90 transition-colors"
            >
              My Subjects
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-md border border-border p-6">
            <h3 className="text-lg font-semibold text-text mb-2">My Class</h3>
            <p className="text-3xl font-bold text-primary">
              {classLoading ? 'Loading...' : studentClass ? `${studentClass.name} ${studentClass.section}` : 'Not Assigned'}
            </p>
            <p className="text-sm text-text-muted">Current class</p>
          </div>
          <div className="bg-card rounded-lg shadow-md border border-border p-6">
            <h3 className="text-lg font-semibold text-text mb-2">My Subjects</h3>
            <p className="text-3xl font-bold text-success">
              {subjectsLoading ? 'Loading...' : studentSubjects?.length || 0}
            </p>
            <p className="text-sm text-text-muted">Assigned subjects</p>
          </div>
          <div className="bg-card rounded-lg shadow-md border border-border p-6">
            <h3 className="text-lg font-semibold text-text mb-2">Total Subjects</h3>
            <p className="text-3xl font-bold text-purple-600">
              {subjectsLoading ? 'Loading...' : studentSubjects?.length || 0}
            </p>
            <p className="text-sm text-text-muted">Subjects assigned to you</p>
          </div>
          <div className="bg-card rounded-lg shadow-md border border-border p-6">
            <h3 className="text-lg font-semibold text-text mb-2">Upcoming Classes</h3>
            <p className="text-3xl font-bold text-warning">{upcomingClasses.length}</p>
            <p className="text-sm text-text-muted">Live classes scheduled</p>
          </div>
        </div>

        {/* Live Classes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-lg shadow-md border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text">Active Assignments</h2>
              <button
                onClick={() => navigate(ROUTES.STUDENT_ASSIGNMENTS)}
                className="text-primary hover:text-primary hover:opacity-80 text-sm font-medium"
              >
                View All
              </button>
            </div>
            {activeAssignments.length > 0 ? (
              <div className="space-y-3">
                {activeAssignments.map((assignment) => (
                  <div key={assignment._id} className="rounded-lg border border-border bg-card-alt p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-text">{assignment.title}</h3>
                        <p className="text-sm text-text-muted">{assignment.duration} min · {assignment.totalMarks} marks</p>
                      </div>
                      <button
                        onClick={() => navigate(ROUTES.STUDENT_ASSIGNMENTS)}
                        className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary hover:opacity-90"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">No active assignments right now.</p>
            )}
          </div>

          {/* Upcoming Live Classes */}
          <div className="bg-card rounded-lg shadow-md border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text">Upcoming Live Classes</h2>
              <button
                onClick={() => navigate(ROUTES.STUDENT_LIVE_CLASSES)}
                className="text-primary hover:text-primary hover:opacity-80 text-sm font-medium"
              >
                View All
              </button>
            </div>

            {liveClassesLoading ? (
              <div className="text-center py-4">Loading classes...</div>
            ) : liveClassesError ? (
              <div className="text-center py-4 text-danger">
                Error loading live classes: {liveClassesError?.data?.message || liveClassesError?.message}
              </div>
            ) : upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map((liveClass) => {
                  const timeRemaining = formatTimeRemaining(liveClass.scheduledAt);
                  const classDate = new Date(liveClass.scheduledAt);

                  return (
                    <div key={liveClass._id} className="border border-border bg-card-alt rounded-lg p-4 hover:bg-card transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-text">{liveClass.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          timeRemaining.isLive ? 'bg-success bg-opacity-20 text-success' : 'bg-primary bg-opacity-20 text-primary'
                        }`}>
                          {timeRemaining.isLive ? 'Live Now' : 'Upcoming'}
                        </span>
                      </div>

                      <div className="mb-2 space-y-1 text-sm text-text-muted">
                        <p>
                          <span className="font-medium text-text">Class:</span>{' '}
                          {liveClass.classId ? `${liveClass.classId.name} ${liveClass.classId.section}` : 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium text-text">Subject:</span> {liveClass.subjectId?.name || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium text-text">Teacher:</span> {liveClass.teacherId?.name || 'N/A'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-sm text-text-muted mb-3">
                        <span>{classDate.toLocaleDateString()}</span>
                        <span>{classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium text-text">Starts in: </span>
                          <span className={`font-mono ${timeRemaining.isLive ? 'text-success' : 'text-primary'}`}>
                            {timeRemaining.text}
                          </span>
                        </div>

                        <button
                          onClick={() => handleJoinClass(liveClass._id, liveClass.meetingUrl || liveClass.meetingLink)}
                          disabled={!timeRemaining.isLive && timeRemaining.text === 'Class Started'}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            timeRemaining.isLive
                              ? 'bg-success text-white hover:bg-success hover:opacity-90'
                              : 'bg-primary text-white hover:bg-primary hover:opacity-90'
                          } disabled:bg-text-muted disabled:text-text-muted opacity-60`}
                        >
                          {timeRemaining.isLive ? 'Join Now' : 'Join When Available'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <p>No upcoming live classes</p>
                <button
                  onClick={() => navigate(ROUTES.STUDENT_LIVE_CLASSES)}
                  className="mt-2 text-primary hover:text-primary hover:opacity-80 text-sm"
                >
                  Browse all classes
                </button>
              </div>
            )}
          </div>

          {/* My Subjects */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Subjects</h2>
            {subjectsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : studentSubjects && studentSubjects.length > 0 ? (
              <div className="space-y-3">
                {studentSubjects.slice(0, 4).map((subjectAssignment) => (
                  <div key={subjectAssignment._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{subjectAssignment.subjectId?.name}</h3>
                        <p className="text-sm text-gray-600">Teacher: {subjectAssignment.teacherId?.name}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/student/subject/${subjectAssignment.subjectId?._id}`)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="rounded-lg bg-white p-2 border border-gray-200">
                        <p className="font-semibold text-gray-900">{subjectAssignment.chapterCount || 0}</p>
                        <p>Chapters</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-gray-200">
                        <p className="font-semibold text-gray-900">{subjectAssignment.lessonCount || 0}</p>
                        <p>Lessons</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-gray-200">
                        <p className="font-semibold text-gray-900">{subjectAssignment.videoCount || 0}</p>
                        <p>Videos</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-gray-200 col-span-2">
                        <p className="font-semibold text-gray-900">{subjectAssignment.noteCount || 0}</p>
                        <p>Notes</p>
                      </div>
                    </div>
                  </div>
                ))}
                {studentSubjects.length > 4 && (
                  <button
                    onClick={() => navigate('/student/subjects')}
                    className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    View All Subjects
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No subjects assigned yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate(ROUTES.STUDENT_SUBJECTS)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium text-gray-900">My Subjects</div>
            </button>

            <button
              onClick={() => navigate(ROUTES.STUDENT_RECORDED_VIDEOS)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎥</div>
              <div className="text-sm font-medium text-gray-900">Videos</div>
            </button>

            <button
              onClick={() => navigate(ROUTES.STUDENT_LIVE_CLASSES)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📹</div>
              <div className="text-sm font-medium text-gray-900">Live Classes</div>
            </button>

            <button
              onClick={() => navigate(ROUTES.STUDENT_ASSIGNMENTS)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">Assignments</div>
              <div className="text-sm font-medium text-gray-900">Assignments</div>
            </button>

            <button
              onClick={() => navigate(ROUTES.STUDENT_ANALYTICS)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900">Analytics</div>
            </button>
          </div>
        </div>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentDashboard;

