import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { 
  useMarkClassAttendanceMutation, 
  useMarkIndividualAttendanceMutation,
  useGetAttendanceClassesQuery,
  useGetAttendanceStudentsQuery,
  useGetClassAttendanceQuery
} from '../redux/attendanceApi';
import { useAuth } from '../context/AuthContext';

const AttendancePage = () => {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [selfStatus, setSelfStatus] = useState('present');
  const [toast, setToast] = useState(null);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  // API queries
  const { data: classes = [], isLoading: classesLoading } = useGetAttendanceClassesQuery();
  const { 
    data: studentsData, 
    isLoading: studentsLoading,
    refetch: refetchStudents 
  } = useGetAttendanceStudentsQuery(selectedClassId, {
    skip: !selectedClassId || isStudent
  });

  const {
    data: existingAttendance,
    isLoading: existingLoading,
  } = useGetClassAttendanceQuery(
    { classId: selectedClassId, date: selectedDate },
    { skip: !selectedClassId || !selectedDate || isStudent }
  );

  // Mutations
  const [markClassAttendance, { isLoading: submittingClass }] = useMarkClassAttendanceMutation();
  const [markIndividualAttendance, { isLoading: submittingIndividual }] = useMarkIndividualAttendanceMutation();

  const students = studentsData?.students || [];

  useEffect(() => {
    if (selectedClassId) {
      refetchStudents();
    }
  }, [selectedClassId, refetchStudents]);

  // Sync existing attendance to state
  useEffect(() => {
    if (existingAttendance?.students) {
      const statuses = {};
      existingAttendance.students.forEach(record => {
        statuses[record.studentId] = record.status;
      });
      setStudentStatuses(statuses);
    } else {
      // Initialize with 'present' for all students if no record exists
      const initialStatuses = {};
      students.forEach(student => {
        initialStatuses[student._id] = 'present';
      });
      setStudentStatuses(initialStatuses);
    }
  }, [existingAttendance, students]);

  const showToast = (type, message) => setToast({ type, message });

  const handleStatusChange = (studentId, status) => {
    setStudentStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    try {
      if (isStudent) {
        // Student marks their own attendance
        const studentClass = classes.find(cls => cls._id === user?.classId || cls._id === user?.class);
        if (!studentClass) {
          showToast('error', 'You are not assigned to any class');
          return;
        }

        await markIndividualAttendance({
          classId: studentClass._id,
          date: selectedDate,
          status: selfStatus,
          method: 'manual'
        }).unwrap();
        
        showToast('success', 'Attendance marked successfully!');
      } else if (isTeacher) {
        // Teacher marks attendance for entire class
        if (!selectedClassId) {
          showToast('error', 'Please select a class');
          return;
        }

        const studentsToMark = students.map(student => ({
          studentId: student._id,
          status: studentStatuses[student._id] || 'absent'
        }));

        await markClassAttendance({
          classId: selectedClassId,
          date: selectedDate,
          students: studentsToMark
        }).unwrap();
        
        showToast('success', 'Class attendance marked successfully!');
        // Reset student statuses after successful submission
        setStudentStatuses({});
      }
    } catch (error) {
      showToast('error', error.data?.message || 'Failed to mark attendance');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        {isStudent ? 'My Attendance' : 'Mark Attendance'}
      </h1>
      
            
      <div className="grid gap-6 md:grid-cols-3">
        {!isStudent && (
          <div className="md:col-span-1">
            <label className="block mb-2 font-medium">Class</label>
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="input-field"
              disabled={classesLoading}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} {cls.section}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block mb-2 font-medium">Date</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={handleSubmit}
            disabled={
              (isStudent ? false : !selectedClassId) || 
              (submittingClass || submittingIndividual)
            }
            className="btn-primary w-full justify-center"
          >
            {(submittingClass || submittingIndividual) ? 'Submitting...' : 
             isStudent ? 'Mark My Attendance' : 
             (existingAttendance?.students?.length > 0 ? 'Update Attendance' : 'Submit Attendance')}
          </button>
        </div>
      </div>

      {/* Student View */}
      {isStudent && (
        <div className="mt-8 card">
          <div className="px-6 py-4 border-b bg-card-alt flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mark Your Attendance</h2>
            {existingAttendance?.students?.length > 0 && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                existingAttendance.students[0].status === 'present' ? 'bg-success-light text-success' :
                existingAttendance.students[0].status === 'late' ? 'bg-warning-light text-warning' :
                'bg-danger-light text-danger'
              }`}>
                Already Marked: {existingAttendance.students[0].status.toUpperCase()}
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="max-w-md">
              <label className="block mb-2 font-medium">Your Status</label>
              <select 
                value={selfStatus}
                onChange={(e) => setSelfStatus(e.target.value)}
                className="input-field"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Teacher View */}
      {isTeacher && (
        <>
          {studentsLoading || existingLoading ? (
            <Loader />
          ) : students.length === 0 ? (
            <EmptyState title="No Students" description="No students in selected class" />
          ) : (
            <div className="mt-8 card">
              <div className="px-6 py-4 border-b bg-card-alt flex justify-between items-center">
                <h2 className="text-xl font-semibold">Student List ({students.length})</h2>
                <div className="flex gap-4 items-center">
                  <button 
                    onClick={() => {
                      const allPresent = {};
                      students.forEach(s => allPresent[s._id] = 'present');
                      setStudentStatuses(allPresent);
                    }}
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    Mark All Present
                  </button>
                  <div className="h-4 w-px bg-border mx-2"></div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-success"></span>
                      <span className="text-sm text-text-muted">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-warning"></span>
                      <span className="text-sm text-text-muted">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-danger"></span>
                      <span className="text-sm text-text-muted">Absent</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-card-alt">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Roll No</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Current Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Mark Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((student) => {
                      const currentStatus = studentStatuses[student._id];
                      return (
                        <tr key={student._id} className={currentStatus === 'absent' ? 'bg-danger-light/10' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-text">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-text-muted">{student.rollNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              currentStatus === 'present' ? 'text-success bg-success-light' :
                              currentStatus === 'late' ? 'text-warning bg-warning-light' :
                              'text-danger bg-danger-light'
                            }`}>
                              {currentStatus?.toUpperCase() || 'NOT MARKED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select 
                              value={currentStatus || 'present'}
                              onChange={(e) => handleStatusChange(student._id, e.target.value)}
                              className={`input-field text-sm py-1 ${
                                currentStatus === 'present' ? 'border-success focus:ring-success' :
                                currentStatus === 'late' ? 'border-warning focus:ring-warning' :
                                'border-danger focus:ring-danger'
                              }`}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toast Component */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;

