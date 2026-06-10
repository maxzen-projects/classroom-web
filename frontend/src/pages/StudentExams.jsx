import React from 'react';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import { useGetExamsQuery, useGetStudentMarksQuery, useGetStudentPerformanceQuery } from '../redux/externalExamsApi';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StudentExams = () => {
  const { user } = useAuth();
  const studentId = user?.id || user?._id;
  const { data: exams, isLoading: examsLoading } = useGetExamsQuery();
  const { data: marks, isLoading: marksLoading } = useGetStudentMarksQuery(studentId, {
    skip: !studentId,
  });
  const { data: performance, isLoading: performanceLoading } = useGetStudentPerformanceQuery(studentId, {
    skip: !studentId,
  });

  const chartData = performance ? [
    { name: 'Attendance', value: performance.attendancePercentage, color: '#3B82F6' },
    { name: 'Assignments', value: performance.assignmentPercentage, color: '#10B981' },
    { name: 'Exams', value: performance.examPercentage, color: '#F59E0B' },
    { name: 'Overall', value: performance.overallPerformance, color: '#8B5CF6' }
  ] : [];

  const pieData = performance ? [
    { name: 'Attendance (20%)', value: performance.attendancePercentage * 0.2 },
    { name: 'Assignments (30%)', value: performance.assignmentPercentage * 0.3 },
    { name: 'Exams (50%)', value: performance.examPercentage * 0.5 }
  ] : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

  if (examsLoading || marksLoading || performanceLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Exam Results & Performance</h1>

        {/* Performance Overview */}
        {performance && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Breakdown</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Attendance (20%)</span>
                  <span className="font-bold text-blue-600">{performance.attendancePercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(performance.attendancePercentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assignments (30%)</span>
                  <span className="font-bold text-green-600">{performance.assignmentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(performance.assignmentPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Exams (50%)</span>
                  <span className="font-bold text-yellow-600">{performance.examPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(performance.examPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-semibold">Overall Performance</span>
                    <span className="font-bold text-purple-600 text-xl">{performance.overallPerformance.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weightage Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Exam Results */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Exam Results</h2>
          </div>
          {marks && marks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks Obtained
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marks.map((mark) => {
                    const percentage = (mark.marksObtained / mark.examId?.totalMarks) * 100;
                    const isPass = percentage >= (mark.examId?.passingMarks / mark.examId?.totalMarks) * 100;
                    return (
                      <tr key={mark._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{mark.examId?.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{mark.examId?.subjectId?.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {mark.examId?.examDate ? new Date(mark.examId.examDate).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{mark.marksObtained}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{mark.examId?.totalMarks}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                            {percentage.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isPass ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No exam results yet"
                description="Your exam results will appear here once they are available."
                icon="📋"
              />
            </div>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentExams;
