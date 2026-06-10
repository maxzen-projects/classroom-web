import React, { useState } from 'react';
import { useCreateLiveClassMutation, useGetTeacherLiveClassesQuery } from '../redux/academicApi';
import { useGetTeacherSubjectsQuery } from '../redux/teacherApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import LiveClassFormModal from '../components/LiveClassFormModal';
import LiveClassDetailsModal from '../components/LiveClassDetailsModal';
import AttendanceModal from '../components/AttendanceModal';
import {useUpdateLiveClassStatusMutation, useDeleteLiveClassMutation,useUpdateLiveClassMutation} from '../redux/academicApi';
const TeacherScheduleLiveClass = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    scheduledAt: '',
    duration: '',
    meetingUrl: '',
    platform: 'zoom'
  });
  const [toast, setToast] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: teacherSubjects, isLoading: teacherSubjectsLoading } = useGetTeacherSubjectsQuery();
  const { data: liveClasses, refetch } = useGetTeacherLiveClassesQuery();
  const [createLiveClass, { isLoading }] = useCreateLiveClassMutation();
  const [showEditModal, setShowEditModal] = useState(false);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [showAttendanceModal, setShowAttendanceModal] = useState(false);
const [selectedLiveClass, setSelectedLiveClass] = useState(null);
const [updateLiveClass, { isLoading: isUpdating }] = useUpdateLiveClassMutation();

const [updateStatus] = useUpdateLiveClassStatusMutation();
const [deleteLiveClass] = useDeleteLiveClassMutation();

  const teacherClasses = teacherSubjects
    ? teacherSubjects.reduce((classes, subject) => {
        const classItem = subject.class;
        if (!classItem) return classes;
        if (!classes.some((existingClass) => existingClass._id === classItem._id)) {
          classes.push(classItem);
        }
        return classes;
      }, [])
    : [];

  const availableSubjects = teacherSubjects?.filter(
    (subject) => subject.class?._id === formData.classId
  ) || [];


const formatForInput = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  const pad = (n) => n.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      ...(name === 'classId' ? { subjectId: '' } : {}),
      [name]: value
    }));
  };

const handleStatusChange = async (id, status) => {
  try {
    await updateLiveClass({ id, status }).unwrap(); // ✅ FIXED

    setToast({ type: 'success', message: 'Status updated' });
    refetch();
  } catch (err) {
    console.error("STATUS ERROR:", err); // 👈 ADD THIS
    setToast({
      type: 'error',
      message: err?.data?.message || 'Failed to update status'
    });
  }
};

const handleDelete = async (id) => {
  if (!window.confirm('Delete this class?')) return;

  try {
    await deleteLiveClass(id).unwrap();
    setToast({ type: 'success', message: 'Deleted successfully' });
    refetch();
  } catch (err) {
    console.error("DELETE ERROR:", err); // 👈 ADD THIS
    setToast({ type: 'error', message: err?.data?.message || 'Delete failed' });
  }
};

const getAutoStatus = (scheduledAt, duration) => {
  const now = new Date();
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + duration * 60000);

  if (now < start) return 'scheduled';
  if (now >= start && now <= end) return 'ongoing';
  return 'completed';
};

const getStatusBadge = (status) => {
  const map = {
    scheduled: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status]}`}>
      {status}
    </span>
  );
};




 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
   const scheduledAt = new Date(formData.scheduledAt).toISOString();

    const payload = {
      ...formData,
      scheduledAt,
    };

    if (isEditMode) {
      await updateLiveClass({
        id: selectedLiveClass._id,
        ...payload,
      }).unwrap();

      setToast({ type: 'success', message: 'Live class updated successfully!' });
    } else {
      await createLiveClass(payload).unwrap();

      setToast({ type: 'success', message: 'Live class scheduled successfully!' });
    }

    refetch();

    // reset form
    setFormData({
      title: '',
      description: '',
      classId: '',
      subjectId: '',
      scheduledAt: '',
      duration: '',
      meetingUrl: '',
      platform: 'zoom'
    });

    setIsEditMode(false);
    setSelectedLiveClass(null);

  } catch (error) {
    console.error("UPDATE ERROR:", error); // 👈 VERY IMPORTANT for debugging

    setToast({
      type: 'error',
      message: error?.data?.message || 'Operation failed'
    });
  }
};

  if (teacherSubjectsLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center">Loading live class setup...</div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Schedule Live Class</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule New Class</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter class title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter class description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class *
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a class</option>
                  {teacherClasses.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      Class {classItem.name} - Section {classItem.section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject *
                </label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  required
                  disabled={!formData.classId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">
                    {formData.classId ? 'Select a subject' : 'Select a class first'}
                  </option>
                  {availableSubjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.title}
                    </option>
                  ))}
                </select>
                {formData.classId && availableSubjects.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    No subjects are assigned to you for this class yet.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="15"
                  max="480"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zoom">Zoom</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="microsoft_teams">Microsoft Teams</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting URL *
                </label>
                <input
                  type="url"
                  name="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>

            <button
  type="submit"
  disabled={isLoading || isUpdating}
  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
>
  {(isLoading || isUpdating)
    ? (isEditMode ? 'Updating...' : 'Scheduling...')
    : (isEditMode ? 'Update Class' : 'Schedule Class')}
</button>
            </form>
          </div>

          {/* Upcoming Classes */}
          {/* Teacher Live Classes Table */}
<div className="bg-white rounded-lg shadow-md p-6 mt-6 col-span-2">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    My Live Classes
  </h2>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Details</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {liveClasses && liveClasses.length > 0 ? (
          liveClasses.map((liveClass) => {
            const start = new Date(liveClass.scheduledAt);
            const end = new Date(start.getTime() + liveClass.duration * 60000);
            const status = getAutoStatus(liveClass.scheduledAt, liveClass.duration);

            return (
              <tr key={liveClass._id} className="hover:bg-gray-50">
                
                {/* Class Details */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {liveClass.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {liveClass.classId?.name} - {liveClass.classId?.section}
                  </div>
                </td>

                {/* Schedule */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{start.toLocaleDateString()}</div>
                  <div>
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                    {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>{liveClass.duration} min</div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
  <span className={`px-2 py-1 text-xs rounded ${
    status === 'scheduled'
      ? 'bg-blue-100 text-blue-800'
      : status === 'ongoing'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }`}>
    {status === 'scheduled' && 'Upcoming'}
    {status === 'ongoing' && 'Live Now'}
    {status === 'completed' && 'Completed'}
  </span>
</td>

                {/* Students */}
                <td className="px-6 py-4 text-sm">
                  {liveClass.attendees?.length || 0} joined
                </td>

                {/* Actions */}
              <td className="px-6 py-4">
  <div className="flex space-x-2">

  <button
  onClick={() => {
    if (liveClass.meetingUrl) {
      window.open(liveClass.meetingUrl, "_blank");
    } else {
      setToast({ type: 'error', message: 'Meeting link not available' });
    }
  }}
  className="text-blue-600 hover:text-blue-900 text-sm"
>
  Join
</button>

    <button
  onClick={() => {
      console.log("EDIT DATA:", liveClass); // ✅ HERE
        const formattedDate = formatForInput(liveClass.scheduledAt);
          console.log("FORM DATA:", formattedDate); // ✅ HERE
    setIsEditMode(true);
    setSelectedLiveClass(liveClass);

    setFormData({
      title: liveClass.title || '',
      description: liveClass.description || '',
      classId: liveClass.classId?._id || '',
      subjectId: liveClass.subjectId?._id || '',
      scheduledAt: formattedDate,
      duration: liveClass.duration || '',
      meetingUrl: liveClass.meetingUrl || '',
      platform: liveClass.platform || 'zoom'
    });

    window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll to form
  }}
  className="text-green-600 hover:text-green-900 text-sm"
>
  Edit
</button>

    {liveClass.meetingUrl && (
      <button
        onClick={() => navigator.clipboard.writeText(liveClass.meetingUrl)}
        className="text-purple-600 hover:text-purple-900 text-sm"
      >
        Copy Link
      </button>
    )}

    
    <button
      onClick={() => handleDelete(liveClass._id)}
      className="text-red-600 hover:text-red-900 text-sm"
    >
      Delete
    </button>

  </div>
</td>

              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="5" className="text-center py-4 text-gray-500">
              No live classes found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
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

export default TeacherScheduleLiveClass;

