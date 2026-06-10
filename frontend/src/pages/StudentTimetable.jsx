import React, { useMemo, useState } from 'react';
import { useGetMyTimetableQuery, useGetPeriodAttendanceSummaryQuery } from '../redux/timetableApi';
import Loader from '../components/Loader';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const StudentTimetable = () => {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const { data: timetableData, isLoading: timetableLoading } = useGetMyTimetableQuery();
  const { data: summaryData, isLoading: summaryLoading } = useGetPeriodAttendanceSummaryQuery({ month, year });
  const periods = timetableData?.periods || [];

  const maxPeriod = Math.max(8, ...periods.map((period) => Number(period.periodNumber || 0)));
  const periodNumbers = Array.from({ length: maxPeriod }, (_, index) => index + 1);

  const periodGrid = useMemo(() => {
    const map = new Map();
    periods.forEach((period) => map.set(`${period.dayOfWeek}-${period.periodNumber}`, period));
    return map;
  }, [periods]);

  if (timetableLoading || summaryLoading) {
    return <Loader />;
  }

  const summary = summaryData?.summary || { totalMarkedPeriods: 0, attendedPeriods: 0, absentPeriods: 0, percentage: 0 };
  const subjectWise = summaryData?.subjectWise || [];
  const daily = summaryData?.daily || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
          <p className="mt-1 text-gray-600">Weekly class schedule and period-wise attendance percentage.</p>
        </div>
        <div className="flex gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Month</span>
            <input type="number" min="1" max="12" value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1 w-28 rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Year</span>
            <input type="number" min="2020" value={year} onChange={(event) => setYear(event.target.value)} className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2" />
          </label>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Attendance</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.percentage}%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Attended Periods</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{summary.attendedPeriods}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Absent Periods</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{summary.absentPeriods}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total Marked</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{summary.totalMarkedPeriods}</p>
        </div>
      </div>

      <section className="mb-8 overflow-x-auto rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Weekly Timetable</h2>
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-3 text-left font-semibold text-gray-700">Day</th>
              {periodNumbers.map((periodNumber) => (
                <th key={periodNumber} className="min-w-44 border-l border-gray-200 p-3 text-left font-semibold text-gray-700">Period {periodNumber}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td className="sticky left-0 border-t border-gray-200 bg-white p-3 font-semibold capitalize text-gray-900">{day}</td>
                {periodNumbers.map((periodNumber) => {
                  const period = periodGrid.get(`${day}-${periodNumber}`);
                  return (
                    <td key={periodNumber} className="border-l border-t border-gray-200 p-3 align-top">
                      {period ? (
                        <div className="rounded-md bg-blue-50 p-3">
                          <p className="font-semibold text-blue-900">{period.subjectId?.name}</p>
                          <p className="mt-1 text-xs text-blue-700">{period.teacherId?.name}</p>
                          <p className="mt-2 text-xs text-blue-700">{period.startTime} - {period.endTime}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Free</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Subject Attendance</h2>
          <div className="space-y-4">
            {subjectWise.map((subject) => (
              <div key={subject.subjectId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{subject.subjectName}</span>
                  <span className="text-gray-600">{subject.attended}/{subject.total} | {subject.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${subject.percentage}%` }} />
                </div>
              </div>
            ))}
            {subjectWise.length === 0 && <p className="text-gray-500">No period attendance marked yet.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Daily Attendance</h2>
          <div className="space-y-3">
            {daily.map((day) => (
              <div key={day.date} className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                <div>
                  <p className="font-medium text-gray-900">{day.date}</p>
                  <p className="text-sm text-gray-600">{day.attended}/{day.total} periods attended</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{day.percentage}%</p>
              </div>
            ))}
            {daily.length === 0 && <p className="text-gray-500">No daily attendance records yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentTimetable;
