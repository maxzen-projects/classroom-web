import React, { useEffect, useMemo, useState } from 'react';
import {
  useGetMyTimetableQuery,
  useGetPeriodAttendanceQuery,
  useGetTeacherTodayPeriodsQuery,
  useMarkPeriodAttendanceMutation,
} from '../redux/timetableApi';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const todayInputValue = () => new Date().toISOString().split('T')[0];

const TeacherTimetable = () => {
  const [date, setDate] = useState(todayInputValue());
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [attendance, setAttendance] = useState({});
  const [toast, setToast] = useState(null);
  const { data: weeklyData, isLoading: weeklyLoading } = useGetMyTimetableQuery();
  const { data: todayData, isLoading: todayLoading } = useGetTeacherTodayPeriodsQuery(date);
  const { data: attendanceData, isLoading: attendanceLoading } = useGetPeriodAttendanceQuery(
    { periodId: selectedPeriodId, date },
    { skip: !selectedPeriodId }
  );
  const [markAttendance, { isLoading: saving }] = useMarkPeriodAttendanceMutation();

  const weeklyPeriods = weeklyData?.periods || [];
  const todayPeriods = todayData?.periods || [];

  const groupedWeekly = useMemo(() => {
    const map = new Map(DAYS.map((day) => [day, []]));
    weeklyPeriods.forEach((period) => {
      map.set(period.dayOfWeek, [...(map.get(period.dayOfWeek) || []), period]);
    });
    return map;
  }, [weeklyPeriods]);

  useEffect(() => {
    if (!attendanceData) return;
    const recordMap = new Map(attendanceData.records.map((record) => [record.studentId?._id || record.studentId, record.status]));
    const nextAttendance = {};
    attendanceData.students.forEach((student) => {
      nextAttendance[student._id] = recordMap.get(student._id) || 'present';
    });
    setAttendance(nextAttendance);
  }, [attendanceData]);

  const handleSave = async () => {
    const students = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
    try {
      await markAttendance({ periodId: selectedPeriodId, date, students }).unwrap();
      setToast({ type: 'success', message: 'Period attendance saved.' });
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to save attendance.' });
    }
  };

  if (weeklyLoading || todayLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
          <p className="mt-1 text-gray-600">View assigned periods and take attendance only for your class period.</p>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Attendance Date</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 rounded-md border border-gray-300 px-3 py-2" />
        </label>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Periods</h2>
          <span className="text-sm text-gray-500">{todayPeriods.length} assigned</span>
        </div>
        {todayPeriods.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {todayPeriods.map((period) => (
              <button
                key={period._id}
                type="button"
                onClick={() => setSelectedPeriodId(period._id)}
                className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                  selectedPeriodId === period._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Period {period.periodNumber}: {period.subjectId?.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{period.classId?.name} {period.classId?.section}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{period.startTime}</span>
                </div>
                <p className="mt-4 text-sm text-gray-700">{period.startTime} - {period.endTime}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            No periods assigned for this date.
          </div>
        )}
      </section>

      {selectedPeriodId && (
        <section className="mb-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Take Attendance</h2>
            <button type="button" disabled={saving || attendanceLoading} onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>

          {attendanceLoading ? (
            <Loader />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(attendanceData?.students || []).map((student) => (
                <div key={student._id} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.rollNumber || student.email}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {['present', 'absent', 'late'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAttendance((current) => ({ ...current, [student._id]: status }))}
                        className={`rounded-md border px-2 py-2 text-xs font-semibold capitalize ${
                          attendance[student._id] === status ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold text-gray-900">Weekly Timetable</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {DAYS.map((day) => (
            <div key={day} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold capitalize text-gray-900">{day}</h3>
              <div className="mt-3 space-y-3">
                {(groupedWeekly.get(day) || []).sort((first, second) => first.periodNumber - second.periodNumber).map((period) => (
                  <div key={period._id} className="rounded-md bg-gray-50 p-3">
                    <p className="font-medium text-gray-900">Period {period.periodNumber}: {period.subjectId?.name}</p>
                    <p className="text-sm text-gray-600">{period.classId?.name} {period.classId?.section} | {period.startTime} - {period.endTime}</p>
                  </div>
                ))}
                {(groupedWeekly.get(day) || []).length === 0 && <p className="text-sm text-gray-500">No assigned periods.</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeacherTimetable;
