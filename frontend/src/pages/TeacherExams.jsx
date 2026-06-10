import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import { useGetExamsQuery, useCreateExamMutation, useDeleteExamMutation } from '../redux/externalExamsApi';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { FaPlus, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { useGetTeacherSubjectsQuery } from '../redux/teacherApi';
import { useGetTeacherClassesQuery } from '../redux/teacherApi';

const TeacherExams = () => {
  const navigate = useNavigate();
  const { data: exams, isLoading, error } = useGetExamsQuery();
  const { data: subjects } = useGetTeacherSubjectsQuery();
  const { data: classes } = useGetTeacherClassesQuery();
  const [createExam] = useCreateExamMutation();
  const [deleteExam] = useDeleteExamMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examDate: new Date().toISOString().split('T')[0],
    subjectId: '',
    classId: '',
    totalMarks: 100,
    passingMarks: 40
  });

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await createExam(formData).unwrap();
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        examDate: new Date().toISOString().split('T')[0],
        subjectId: '',
        classId: '',
        totalMarks: 100,
        passingMarks: 40
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(id).unwrap();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
        <div className="p-6">
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
        <div className="p-6">
          <div className="text-center text-red-600">
            Error loading exams: {error.message}
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">External Exams</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create Exam</span>
          </button>
        </div>

        {exams && exams.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exam.subjectId?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exam.classId?.name} {exam.classId?.section}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(exam.examDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exam.totalMarks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exam.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(ROUTES.TEACHER_EXAM_DETAILS.replace(':examId', exam._id))}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                            title="View/Edit Marks"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam._id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No exams found"
            description="Create your first external exam to get started."
            icon="📝"
          />
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Exam">
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => {
                    const selectedSubjectId = e.target.value;
                    const selectedSubject = subjects?.find(s => s._id === selectedSubjectId);
                    setFormData({ 
                      ...formData, 
                      subjectId: selectedSubjectId,
                      classId: selectedSubject?.class?._id || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects?.map((subject) => (
                    <option key={subject._id} value={subject._id}>{subject.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {(() => {
                    let filteredClasses = classes;
                    if (formData.subjectId) {
                      const selectedSubject = subjects?.find(s => s._id === formData.subjectId);
                      if (selectedSubject?.class?._id) {
                        filteredClasses = classes?.filter(c => c._id === selectedSubject.class._id);
                      }
                    }
                    return filteredClasses?.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.name} {cls.section}</option>
                    ));
                  })()}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Exam
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherExams;
