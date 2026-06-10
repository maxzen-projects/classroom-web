import React, { useMemo, useState } from 'react';
import {
  useEvaluateSubmissionMutation,
  useGetAssignmentsQuery,
  useGetSubmissionsQuery,
} from '../redux/assignmentApi';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { formatMarks } from '../utils/assignmentMarks';

const getClassId = (assignment) => assignment.classId?._id || assignment.classId || 'unassigned';

const getClassName = (assignment) => {
  const classInfo = assignment.classId;
  if (!classInfo || typeof classInfo === 'string') {
    return 'Unassigned Class';
  }

  return `${classInfo.name || 'Class'} ${classInfo.section || ''}`.trim();
};

const getStatusStyles = (status, evaluated) => {
  if (evaluated) {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (status === 'in-progress') {
    return 'bg-amber-50 text-amber-700';
  }

  return 'bg-blue-50 text-blue-700';
};

const formatDateTime = (value) => {
  if (!value) return 'Not submitted';

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const TeacherEvaluate = () => {
  const { data: assignments = [], isLoading: assignmentsLoading } = useGetAssignmentsQuery();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const { data, isLoading: submissionsLoading, refetch } = useGetSubmissionsQuery(selectedAssignmentId, {
    skip: !selectedAssignmentId,
  });
  const [evaluateSubmission, { isLoading: evaluating }] = useEvaluateSubmissionMutation();
  const [marks, setMarks] = useState({});
  const [toast, setToast] = useState(null);

  const classes = useMemo(() => {
    const classMap = new Map();

    assignments.forEach((assignment) => {
      const classId = getClassId(assignment);
      const current = classMap.get(classId) || {
        id: classId,
        name: getClassName(assignment),
        assignments: [],
      };

      current.assignments.push(assignment);
      classMap.set(classId, current);
    });

    return Array.from(classMap.values()).sort((first, second) => first.name.localeCompare(second.name));
  }, [assignments]);

  const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);
  const classAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => getClassId(assignment) === selectedClassId)
        .sort((first, second) => new Date(second.startTime).getTime() - new Date(first.startTime).getTime()),
    [assignments, selectedClassId]
  );

  const selectedAssignment = data?.assignment || assignments.find((assignment) => assignment._id === selectedAssignmentId);
  const submissions = data?.submissions || [];
  const selectedSubmission = submissions.find((submission) => submission._id === selectedSubmissionId);

  const questionMap = useMemo(() => {
    const map = new Map();
    selectedAssignment?.questions?.forEach((question, index) => {
      map.set(question._id, { ...question, index });
    });
    return map;
  }, [selectedAssignment]);

  const assignmentSubmissionStats = useMemo(() => {
    const submitted = submissions.filter((submission) => submission.status !== 'in-progress').length;
    const evaluated = submissions.filter((submission) => submission.totalMarks !== undefined && submission.totalMarks !== null).length;
    return { submitted, evaluated };
  }, [submissions]);

  const selectClass = (classId) => {
    setSelectedClassId(classId);
    setSelectedAssignmentId('');
    setSelectedSubmissionId('');
    setMarks({});
  };

  const selectAssignment = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedSubmissionId('');
    setMarks({});
  };

  const selectSubmission = (submission) => {
    const initialMarks = {};
    submission.answers.forEach((answer) => {
      initialMarks[answer.questionId] = answer.marksAwarded ?? '';
    });

    setSelectedSubmissionId(submission._id);
    setMarks({ [submission._id]: initialMarks });
  };

  const updateMark = (submissionId, questionId, value) => {
    setMarks((current) => ({
      ...current,
      [submissionId]: {
        ...current[submissionId],
        [questionId]: value,
      },
    }));
  };

  const handleEvaluate = async (submission) => {
    if (submission.status === 'in-progress') {
      setToast({ type: 'error', message: 'This student is still working. Evaluation is available after submission.' });
      return;
    }

    const evaluations = submission.answers.map((answer) => ({
      questionId: answer.questionId,
      marksAwarded: Number(marks[submission._id]?.[answer.questionId] ?? answer.marksAwarded ?? 0),
    }));

    const invalid = evaluations.some(
      (evaluation) => !Number.isFinite(evaluation.marksAwarded) || evaluation.marksAwarded < 0 || evaluation.marksAwarded > selectedAssignment.marksPerQuestion
    );

    if (invalid) {
      setToast({ type: 'error', message: `Marks must be between 0 and ${formatMarks(selectedAssignment.marksPerQuestion)} for each question.` });
      return;
    }

    try {
      await evaluateSubmission({ submissionId: submission._id, evaluations }).unwrap();
      setToast({ type: 'success', message: 'Submission evaluated.' });
      refetch();
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to evaluate submission.' });
    }
  };

  if (assignmentsLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Evaluate Assignments</h1>
        <p className="mt-1 text-gray-600">Choose a class, open an assignment, select a student, and enter marks for each answer.</p>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Classes</h2>
          <span className="text-sm text-gray-500">{classes.length} available</span>
        </div>

        {classes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classes.map((classItem) => (
              <button
                key={classItem.id}
                type="button"
                onClick={() => selectClass(classItem.id)}
                className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                  selectedClassId === classItem.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <p className="text-lg font-semibold text-gray-900">{classItem.name}</p>
                <p className="mt-2 text-sm text-gray-600">{classItem.assignments.length} assignments available</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            No classes with assignments yet.
          </div>
        )}
      </section>

      {selectedClass && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{selectedClass.name} Assignments</h2>
            <span className="text-sm text-gray-500">{classAssignments.length} found</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {classAssignments.map((assignment) => (
              <button
                key={assignment._id}
                type="button"
                onClick={() => selectAssignment(assignment._id)}
                className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                  selectedAssignmentId === assignment._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{assignment.description || 'No description'}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                    {assignment.type}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <p>{assignment.numberOfQuestions} questions</p>
                  <p>{formatMarks(assignment.totalMarks)} total</p>
                  <p>{formatMarks(assignment.marksPerQuestion)} each</p>
                  <p>{assignment.duration} min</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {submissionsLoading && <Loader />}

      {selectedAssignment && !submissionsLoading && (
        <section className="mb-8">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Students</h2>
              <p className="text-sm text-gray-600">
                {selectedAssignment.title} | {formatMarks(selectedAssignment.marksPerQuestion)} marks each | {formatMarks(selectedAssignment.totalMarks)} total
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{assignmentSubmissionStats.submitted} submitted</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">{assignmentSubmissionStats.evaluated} evaluated</span>
            </div>
          </div>

          {submissions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {submissions.map((submission) => {
                const evaluated = submission.totalMarks !== undefined && submission.totalMarks !== null;
                return (
                  <button
                    key={submission._id}
                    type="button"
                    onClick={() => selectSubmission(submission)}
                    className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                      selectedSubmissionId === submission._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{submission.studentId?.name || 'Student'}</h3>
                        <p className="mt-1 text-sm text-gray-600">{submission.studentId?.email || 'No email'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusStyles(submission.status, evaluated)}`}>
                        {evaluated ? 'Evaluated' : submission.status}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <p>Submitted: {formatDateTime(submission.submittedAt)}</p>
                      <p>
                        Score: {evaluated ? formatMarks(submission.totalMarks) : 'Pending'} / {formatMarks(selectedAssignment.totalMarks)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              No student submissions yet.
            </div>
          )}
        </section>
      )}

      {selectedSubmission && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Evaluate {selectedSubmission.studentId?.name || 'Student'}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {selectedSubmission.studentId?.email || 'No email'} | {selectedSubmission.status}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Score: {selectedSubmission.totalMarks === undefined || selectedSubmission.totalMarks === null ? 'Pending' : formatMarks(selectedSubmission.totalMarks)} / {formatMarks(selectedAssignment?.totalMarks)}
            </p>
          </div>

          <div className="space-y-4">
            {selectedSubmission.answers.map((answer) => {
              const question = questionMap.get(answer.questionId);
              return (
                <div key={answer.questionId} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {question ? question.index + 1 : ''}. {question?.questionText || 'Question'}
                      </p>
                      <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-800">
                        {answer.answer || <span className="text-gray-500">No answer submitted</span>}
                      </div>
                    </div>

                    <label className="block w-full lg:w-48">
                      <span className="text-sm font-medium text-gray-700">Marks</span>
                      <input
                        type="number"
                        min="0"
                        max={selectedAssignment?.marksPerQuestion}
                        step="0.01"
                        value={marks[selectedSubmission._id]?.[answer.questionId] ?? answer.marksAwarded ?? ''}
                        onChange={(event) => updateMark(selectedSubmission._id, answer.questionId, event.target.value)}
                        disabled={selectedSubmission.status === 'in-progress'}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Max {formatMarks(selectedAssignment?.marksPerQuestion)}</p>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={evaluating || selectedSubmission.status === 'in-progress'}
              onClick={() => handleEvaluate(selectedSubmission)}
              className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {evaluating ? 'Saving...' : 'Save Evaluation'}
            </button>
          </div>
        </section>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeacherEvaluate;
