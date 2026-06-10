import React, { useMemo, useState } from 'react';
import {
  useDeleteTimetablePeriodMutation,
  useGetClassTimetableQuery,
  useSaveTimetablePeriodMutation,
} from '../redux/timetableApi';
import { useGetClassesQuery } from '../redux/academicApi';
import { useGetSubjectsQuery } from '../redux/subjectsApi';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const DAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
];

const emptyForm = {
  dayOfWeek: 'monday',
  periodNumber: 1,
  subjectId: '',
  teacherId: '',
  startTime: '09:00',
  endTime: '09:45',
};

const className = (classItem) => `${classItem.name || 'Class'} ${classItem.section || ''}`.trim();

const normalizeList = (value, key) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const AdminTimetable = () => {
  const { data: classesData = [], isLoading: classesLoading } = useGetClassesQuery();
  const classes = normalizeList(classesData, 'classes');
  const [selectedClassId, setSelectedClassId] = useState('');
  const { data: subjectsData = [], isLoading: subjectsLoading } = useGetSubjectsQuery(selectedClassId, {
    skip: !selectedClassId,
  });
  const subjects = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.data || []);
  const { data: timetableData, isLoading: timetableLoading } = useGetClassTimetableQuery(selectedClassId, {
    skip: !selectedClassId,
  });
  const [savePeriod, { isLoading: saving }] = useSaveTimetablePeriodMutation();
  const [deletePeriod] = useDeleteTimetablePeriodMutation();
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  const periods = timetableData?.periods || [];
  const maxPeriod = Math.max(8, ...periods.map((period) => Number(period.periodNumber || 0)));
  const periodNumbers = Array.from({ length: maxPeriod }, (_, index) => index + 1);

  const selectedSubject = subjects.find((assignment) => assignment.subjectId?._id === form.subjectId);
  const selectedTeacher = selectedSubject?.teacherId;

  const periodGrid = useMemo(() => {
    const map = new Map();
    periods.forEach((period) => {
      map.set(`${period.dayOfWeek}-${period.periodNumber}`, period);
    });
    return map;
  }, [periods]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedClassId) {
      setToast({ type: 'error', message: 'Select a class first.' });
      return;
    }

    try {
      await savePeriod({
        ...form,
        classId: selectedClassId,
        teacherId: selectedTeacher?._id || form.teacherId,
        periodNumber: Number(form.periodNumber),
      }).unwrap();
      setToast({ type: 'success', message: 'Timetable period saved.' });
      setForm((current) => ({ ...current, periodNumber: Number(current.periodNumber) + 1 }));
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to save period.' });
    }
  };

  const handleDelete = async (periodId) => {
    try {
      await deletePeriod(periodId).unwrap();
      setToast({ type: 'success', message: 'Period removed.' });
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to remove period.' });
    }
  };

  if (classesLoading || subjectsLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Timetable Builder</h1>
        <p className="mt-1 text-gray-600">Create weekly class periods and assign each subject to a teacher.</p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Class</span>
            <select
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select class</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {className(classItem)}
                </option>
              ))}
            </select>
          </label>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Day</span>
                <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.dayOfWeek} onChange={(event) => setForm({ ...form, dayOfWeek: event.target.value })}>
                  {DAYS.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Period</span>
                <input type="number" min="1" max="12" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.periodNumber} onChange={(event) => setForm({ ...form, periodNumber: event.target.value })} />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Subject</span>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                value={form.subjectId}
                onChange={(event) => {
                  const selectedSubjectId = event.target.value;
                  const assignment = subjects.find((item) => item.subjectId?._id === selectedSubjectId);
                  setForm({
                    ...form,
                    subjectId: selectedSubjectId,
                    teacherId: assignment?.teacherId?._id || '',
                  });
                }}
              >
                <option value="">Select subject</option>
                {subjects.map((assignment) => (
                  <option key={assignment.subjectId._id} value={assignment.subjectId._id}>
                    {assignment.subjectId.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="block">
              <span className="text-sm font-medium text-gray-700">Subject Teacher</span>
              <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700">
                {selectedTeacher ? selectedTeacher.name : 'Select a subject to show teacher'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Start</span>
                <input type="time" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">End</span>
                <input type="time" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
              </label>
            </div>

            <button type="submit" disabled={saving} className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400">
              {saving ? 'Saving...' : 'Save Period'}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          {timetableLoading && <Loader />}
          {!selectedClassId ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">Select a class to build its timetable.</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white p-3 text-left font-semibold text-gray-700">Day</th>
                  {periodNumbers.map((periodNumber) => (
                    <th key={periodNumber} className="min-w-48 border-l border-gray-200 p-3 text-left font-semibold text-gray-700">Period {periodNumber}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day.id}>
                    <td className="sticky left-0 border-t border-gray-200 bg-white p-3 font-semibold text-gray-900">{day.label}</td>
                    {periodNumbers.map((periodNumber) => {
                      const period = periodGrid.get(`${day.id}-${periodNumber}`);
                      return (
                        <td key={periodNumber} className="border-l border-t border-gray-200 p-3 align-top">
                          {period ? (
                            <div className="rounded-md bg-blue-50 p-3">
                              <p className="font-semibold text-blue-900">{period.subjectId?.name}</p>
                              <p className="mt-1 text-xs text-blue-700">{period.teacherId?.name}</p>
                              <p className="mt-2 text-xs text-blue-700">{period.startTime} - {period.endTime}</p>
                              <button type="button" onClick={() => handleDelete(period._id)} className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700">Remove</button>
                            </div>
                          ) : (
                            <span className="text-gray-400">Empty</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminTimetable;
