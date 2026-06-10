import React, { useEffect, useState } from 'react';
import {
  useCreateLiveClassMutation,
  useGetChaptersQuery,
  useGetClassesQuery,
  useGetSubjectsQuery,
  useUpdateLiveClassMutation
} from '../redux/academicApi.js';

const LiveClassFormModal = ({ liveClass, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    classId: '',
    subjectId: '',
    chapterId: '',
    platform: 'zoom',
    meetingUrl: '',
    scheduledAt: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: classes } = useGetClassesQuery();
  const { data: subjects } = useGetSubjectsQuery();
  const { data: chapters } = useGetChaptersQuery(formData.subjectId, { skip: !formData.subjectId });
  const [createLiveClass] = useCreateLiveClassMutation();
  const [updateLiveClass] = useUpdateLiveClassMutation();

  useEffect(() => {
    if (!liveClass) return;
    const scheduledDate = new Date(liveClass.scheduledAt);
    const endTime = new Date(scheduledDate.getTime() + liveClass.duration * 60000);
    setFormData({
      title: liveClass.title || '',
      classId: liveClass.classId?._id || liveClass.classId || '',
      subjectId: liveClass.subjectId?._id || liveClass.subjectId || '',
      chapterId: liveClass.chapterId?._id || liveClass.chapterId || '',
      platform: liveClass.platform || 'zoom',
      meetingUrl: liveClass.meetingUrl || '',
      scheduledAt: scheduledDate.toISOString().split('T')[0],
      startTime: scheduledDate.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      description: liveClass.description || '',
    });
  }, [liveClass]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'subjectId' ? { chapterId: '' } : {})
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = 'Title is required';
    if (!formData.classId) nextErrors.classId = 'Class is required';
    if (!formData.subjectId) nextErrors.subjectId = 'Subject is required';
    if (!formData.scheduledAt) nextErrors.scheduledAt = 'Date is required';
    if (!formData.startTime) nextErrors.startTime = 'Start time is required';
    if (!formData.endTime) nextErrors.endTime = 'End time is required';

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) nextErrors.endTime = 'End time must be after start time';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${formData.scheduledAt}T${formData.startTime}`);
      const endTime = new Date(`${formData.scheduledAt}T${formData.endTime}`);
      const submitData = {
        title: formData.title,
        classId: formData.classId,
        subjectId: formData.subjectId,
        chapterId: formData.chapterId || null,
        description: formData.description,
        scheduledAt: scheduledAt.toISOString(),
        duration: Math.round((endTime - scheduledAt) / (1000 * 60)),
        meetingUrl: formData.meetingUrl,
        platform: formData.platform,
      };

      if (liveClass) {
        await updateLiveClass({ id: liveClass._id, ...submitData }).unwrap();
      } else {
        await createLiveClass(submitData).unwrap();
      }
      onSuccess();
    } catch (error) {
      setErrors({ submit: error.data?.message || 'Failed to save live class' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{errors.submit}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class Title *</label>
          <input name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
          <select name="classId" value={formData.classId} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
            <option value="">Select Class</option>
            {classes?.map((item) => <option key={item._id} value={item._id}>{item.name} {item.section}</option>)}
          </select>
          {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <select name="subjectId" value={formData.subjectId} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
            <option value="">Select Subject</option>
            {subjects?.map((subject) => <option key={subject._id} value={subject._id}>{subject.name || subject.title}</option>)}
          </select>
          {errors.subjectId && <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
          <select name="chapterId" value={formData.chapterId} onChange={handleInputChange} disabled={!formData.subjectId} className="w-full px-3 py-2 border rounded-md">
            <option value="">Select Chapter</option>
            {chapters?.map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Platform</label>
          <select name="platform" value={formData.platform} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
            <option value="zoom">Zoom</option>
            <option value="google_meet">Google Meet</option>
            <option value="microsoft_teams">Microsoft Teams</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
          <input type="url" name="meetingUrl" value={formData.meetingUrl} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
          <input type="date" name="scheduledAt" value={formData.scheduledAt} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
          <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
          <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
          {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700" disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (liveClass ? 'Update Class' : 'Create Class')}
        </button>
      </div>
    </form>
  );
};

export default LiveClassFormModal;
