import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import {
  useGetExamByIdQuery,
  useGetExamMarksQuery,
  useAddExamMarkMutation,
  useDeleteExamMarkMutation
} from '../redux/externalExamsApi';
import { useGetTeacherStudentsQuery } from '../redux/teacherApi';
import Loader from '../components/Loader';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';

const ExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const { data: exam, isLoading: examLoading } = useGetExamByIdQuery(examId);
  const { data: existingMarks, isLoading: marksLoading } = useGetExamMarksQuery(examId);
  const { data: students, isLoading: studentsLoading } = useGetTeacherStudentsQuery();
  const [addExamMark] = useAddExamMarkMutation();
  const [deleteExamMark] = useDeleteExamMarkMutation();

  const [marksData, setMarksData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize marksData with existing marks
  useEffect(() => {
    if (existingMarks) {
      const initialData = {};
      existingMarks.forEach(mark => {
        initialData[mark.studentId._id] = {
          marksObtained: mark.marksObtained,
          remarks: mark.remarks
        };
      });
      setMarksData(initialData);
    }
  }, [existingMarks]);

  const classStudents = students?.filter(student => 
    exam?.classId?._id ? student.class?._id === exam.classId._id : true
  );

  const handleMarkChange = (studentId, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveMark = async (studentId) => {
    const mark = marksData[studentId];
    if (mark === undefined) return;

    try {
      setIsSaving(true);
      await addExamMark({
        examId,
        studentId,
        marksObtained: mark.marksObtained,
        remarks: mark.remarks
      }).unwrap();
    } catch (err) {
      console.error('Error saving mark:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMark = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this mark?')) {
      const existingMark = existingMarks?.find(m => m.studentId._id === studentId);
      if (existingMark) {
        try {
          await deleteExamMark(existingMark._id).unwrap();
          setMarksData(prev => {
            const newData = { ...prev };
            delete newData[studentId];
            return newData;
          });
        } catch (err) {
          console.error('Error deleting mark:', err);
        }
      }
    }
  };

  if (examLoading || marksLoading || studentsLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
        <div className="p-6">
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  if (!exam) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
        <div className="p-6">
          <div className="text-center text-red-600">Exam not found</div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(ROUTES.TEACHER_EXAMS)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Exams</span>
          </button>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">Subject:</span> {exam.subjectId?.name}
              </div>
              <div>
                <span className="font-medium text-gray-900">Class:</span> {exam.classId?.name} {exam.classId?.section}
              </div>
              <div>
                <span className="font-medium text-gray-900">Exam Date:</span> {new Date(exam.examDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium text-gray-900">Total Marks:</span> {exam.totalMarks}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Student Marks</h2>
          </div>
          {classStudents && classStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks Obtained
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classStudents.map((student) => {
                    const currentMark = marksData[student._id];
                    const existingMark = existingMarks?.find(m => m.studentId._id === student._id);
                    return (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={exam.totalMarks}
                            value={currentMark?.marksObtained || ''}
                            onChange={(e) => handleMarkChange(student._id, 'marksObtained', parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-500">/ {exam.totalMarks}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={currentMark?.remarks || ''}
                            onChange={(e) => handleMarkChange(student._id, 'remarks', e.target.value)}
                            className="w-full max-w-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add remarks..."
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveMark(student._id)}
                              disabled={isSaving}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              <FaSave className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            {existingMark && (
                              <button
                                onClick={() => handleDeleteMark(student._id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                              >
                                <FaTrash className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No students in this class
            </div>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default ExamDetails;
