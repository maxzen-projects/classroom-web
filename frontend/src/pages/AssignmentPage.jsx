import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAssignmentsQuery,
  useStartSubmissionMutation,
  useSubmitAssignmentMutation,
} from '../redux/assignmentApi';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { formatMarks } from '../utils/assignmentMarks';

const formatRemaining = (milliseconds) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const getEndDeadline = (assignment, submission) => {
  const durationEnd = new Date(submission.startedAt).getTime() + Number(assignment.duration) * 60 * 1000;
  return Math.min(durationEnd, new Date(assignment.endTime).getTime());
};

const AssignmentPage = () => {
  const navigate = useNavigate();
  const { data: assignments = [], isLoading, refetch } = useGetAssignmentsQuery();
  const [startSubmission, { isLoading: isStarting }] = useStartSubmissionMutation();
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [remainingMs, setRemainingMs] = useState(0);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAssignments = useMemo(
    () =>
      assignments.filter((assignment) => {
        const startTime = new Date(assignment.startTime).getTime();
        const endTime = new Date(assignment.endTime).getTime();
        return now >= startTime && now <= endTime && !assignment.submission;
      }),
    [assignments, now]
  );

  const upcomingAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => new Date(assignment.startTime).getTime() > now && !assignment.submission)
        .sort((first, second) => new Date(first.startTime).getTime() - new Date(second.startTime).getTime()),
    [assignments, now]
  );

  const submittedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.submission),
    [assignments]
  );

  const submitCurrentAttempt = async (autoSubmit = false) => {
    if (!activeAttempt || isSubmitting || (autoSubmit && autoSubmittedRef.current)) {
      return;
    }

    autoSubmittedRef.current = autoSubmit;
    const payloadAnswers = activeAttempt.assignment.questions.map((question) => ({
      questionId: question._id,
      answer: answers[question._id] || '',
    }));

    try {
      await submitAssignment({
        assignmentId: activeAttempt.assignment._id,
        answers: payloadAnswers,
        autoSubmit,
      }).unwrap();
      setToast({ type: 'success', message: autoSubmit ? 'Time ended. Assignment auto-submitted.' : 'Assignment submitted.' });
      setActiveAttempt(null);
      setAnswers({});
      refetch();
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to submit assignment.' });
    }
  };

  useEffect(() => {
    if (!activeAttempt) {
      return undefined;
    }

    const tick = () => {
      const deadline = getEndDeadline(activeAttempt.assignment, activeAttempt.submission);
      const nextRemaining = deadline - Date.now();
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0) {
        submitCurrentAttempt(true);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeAttempt, answers]);

  const handleStart = async (assignmentId) => {
    try {
      const response = await startSubmission({ assignmentId }).unwrap();
      const initialAnswers = {};
      response.submission.answers.forEach((answer) => {
        initialAnswers[answer.questionId] = answer.answer || '';
      });
      autoSubmittedRef.current = false;
      setAnswers(initialAnswers);
      setActiveAttempt(response);
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to start assignment.' });
    }
  };

  const updateAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  if (isLoading) {
    return <Loader />;
  }

  if (activeAttempt) {
    const { assignment } = activeAttempt;

    return (
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="mt-1 text-sm text-gray-600">{assignment.description}</p>
            <p className="mt-2 text-sm font-medium text-gray-700">
              {assignment.numberOfQuestions} questions · {formatMarks(assignment.marksPerQuestion)} marks each
            </p>
          </div>
          <div className="rounded-lg bg-red-50 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase text-red-700">Time Left</p>
            <p className="font-mono text-2xl font-bold text-red-700">{formatRemaining(remainingMs)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {assignment.questions.map((question, index) => (
            <div key={question._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {index + 1}. {question.questionText}
                </h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                  {question.type}
                </span>
              </div>

              {question.type === 'mcq' ? (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        checked={answers[question._id] === option}
                        onChange={(event) => updateAnswer(question._id, event.target.value)}
                      />
                      <span className="text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question._id] || ''}
                  onChange={(event) => updateAnswer(question._id, event.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Write your answer"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitCurrentAttempt(false)}
            className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="mt-1 text-gray-600">Start assignments during their scheduled window and submit before the timer ends.</p>
      </div>

      {upcomingAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Upcoming</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {upcomingAssignments.map((assignment) => {
              const startsIn = new Date(assignment.startTime).getTime() - now;

              return (
                <div key={assignment._id} className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{assignment.description || 'No description'}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase text-amber-700">
                      Upcoming
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <p>Starts: {formatDateTime(assignment.startTime)}</p>
                    <p>Ends: {formatDateTime(assignment.endTime)}</p>
                    <p>Duration: {assignment.duration} min</p>
                    <p>Total: {formatMarks(assignment.totalMarks)}</p>
                  </div>
                  <div className="mt-5 inline-flex items-center rounded-lg bg-amber-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-amber-700">Starts In</p>
                      <p className="font-mono text-2xl font-bold text-amber-700">{formatRemaining(startsIn)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-xl font-semibold text-gray-900">Active</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {activeAssignments.map((assignment) => (
          <div key={assignment._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{assignment.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{assignment.description || 'No description'}</p>
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase text-green-700">Active</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
              <p>Type: {assignment.type}</p>
              <p>Duration: {assignment.duration} min</p>
              <p>Total: {formatMarks(assignment.totalMarks)}</p>
              <p>Each: {formatMarks(assignment.marksPerQuestion)}</p>
              <p>Ends: {formatDateTime(assignment.endTime)}</p>
            </div>
            <button
              type="button"
              disabled={isStarting}
              onClick={() => handleStart(assignment._id)}
              className="mt-5 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isStarting ? 'Starting...' : 'Start'}
            </button>
          </div>
        ))}
      </div>

      {activeAssignments.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          No active assignments right now.
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">Submitted</h2>
        <div className="space-y-3">
          {submittedAssignments.map((assignment) => (
            <div key={assignment._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-600">{assignment.submission.status}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {assignment.submission.totalMarks === undefined || assignment.submission.totalMarks === null ? 'Pending evaluation' : formatMarks(assignment.submission.totalMarks)} / {formatMarks(assignment.totalMarks)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AssignmentPage;
