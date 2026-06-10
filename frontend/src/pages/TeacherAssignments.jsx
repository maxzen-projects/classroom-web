import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAssignmentsQuery } from '../redux/assignmentApi';
import Loader from '../components/Loader';
import { ROUTES } from '../routes';
import { formatMarks } from '../utils/assignmentMarks';

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const { data: assignments = [], isLoading } = useGetAssignmentsQuery();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-gray-600">Create assignments and manually evaluate student submissions.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.TEACHER_CREATE_ASSIGNMENT)}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create Assignment
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.TEACHER_EVALUATE_ASSIGNMENTS)}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Evaluate
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {assignments.map((assignment) => (
          <div key={assignment._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{assignment.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{assignment.description || 'No description'}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                {assignment.type}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
              <p>Class: {assignment.classId?.name} {assignment.classId?.section}</p>
              <p>Duration: {assignment.duration} min</p>
              <p>Total: {formatMarks(assignment.totalMarks)}</p>
              <p>Each: {formatMarks(assignment.marksPerQuestion)}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(ROUTES.TEACHER_EVALUATE_ASSIGNMENTS)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View Submissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          No assignments created yet.
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
