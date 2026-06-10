import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAssignmentMutation } from '../redux/assignmentApi';
import { useGetTeacherClassesQuery } from '../redux/teacherApi';
import Toast from '../components/Toast';
import { calculateEqualMarks, formatMarks } from '../utils/assignmentMarks';

const emptyQuestion = (type) => ({
  questionText: '',
  type: type === 'mixed' ? 'mcq' : type,
  options: type === 'qa' ? [] : ['', ''],
});

const TeacherCreateAssignment = () => {
  const navigate = useNavigate();
  const { data: classes = [] } = useGetTeacherClassesQuery();
  const [createAssignment, { isLoading }] = useCreateAssignmentMutation();
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'mcq',
    duration: 30,
    startTime: '',
    endTime: '',
    totalMarks: 10,
    numberOfQuestions: 2,
    classId: '',
  });
  const [questions, setQuestions] = useState([emptyQuestion('mcq'), emptyQuestion('mcq')]);

  const marksPerQuestion = useMemo(() => {
    return calculateEqualMarks(form.totalMarks, form.numberOfQuestions);
  }, [form.totalMarks, form.numberOfQuestions]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleTypeChange = (type) => {
    setForm((current) => ({ ...current, type }));
    setQuestions((current) => current.map(() => emptyQuestion(type)));
  };

  const handleQuestionCountChange = (value) => {
    const count = Math.max(1, Number(value) || 1);
    setForm((current) => ({ ...current, numberOfQuestions: count }));
    setQuestions((current) => {
      const next = current.slice(0, count);
      while (next.length < count) {
        next.push(emptyQuestion(form.type));
      }
      return next;
    });
  };

  const updateQuestion = (index, patch) => {
    setQuestions((current) => current.map((question, itemIndex) => (
      itemIndex === index ? { ...question, ...patch } : question
    )));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((current) => current.map((question, itemIndex) => {
      if (itemIndex !== questionIndex) return question;
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const addOption = (questionIndex) => {
    setQuestions((current) => current.map((question, itemIndex) => (
      itemIndex === questionIndex ? { ...question, options: [...question.options, ''] } : question
    )));
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.classId) return 'Class is required.';
    if (!form.startTime || !form.endTime) return 'Start and end time are required.';
    if (new Date(form.startTime) >= new Date(form.endTime)) return 'End time must be after start time.';
    if (Number(form.totalMarks) <= 0) return 'Total marks must be greater than zero.';
    if (!Number.isInteger(Number(form.totalMarks))) return 'Total marks must be a whole number.';
    if (Number(form.numberOfQuestions) !== questions.length) return 'Question count mismatch.';
    if (marksPerQuestion === null) return 'Total marks must divide equally across all questions.';

    for (const question of questions) {
      if (!question.questionText.trim()) return 'Every question needs question text.';
      if (form.type !== 'mixed' && question.type !== form.type) return 'Question type must match assignment type.';
      if (question.type === 'mcq' && question.options.filter(Boolean).length < 2) return 'Every MCQ needs at least two options.';
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setToast({ type: 'error', message: validationError });
      return;
    }

    try {
      await createAssignment({
        ...form,
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        numberOfQuestions: Number(form.numberOfQuestions),
        questions: questions.map((question) => ({
          questionText: question.questionText,
          type: question.type,
          options: question.type === 'mcq' ? question.options.filter(Boolean) : [],
        })),
      }).unwrap();
      setToast({ type: 'success', message: 'Assignment created.' });
      navigate('/teacher/evaluate-assignments');
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to create assignment.' });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
        <p className="mt-1 text-gray-600">All questions share equal marks. No correct answers are stored.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.title} onChange={(event) => setField('title', event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Class</span>
              <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.classId} onChange={(event) => setField('classId', event.target.value)}>
                <option value="">Select class</option>
                {classes.map((classroom) => (
                  <option key={classroom._id} value={classroom._id}>
                    {classroom.name} {classroom.section} · {classroom.academicYear}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" rows={3} value={form.description} onChange={(event) => setField('description', event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Type</span>
              <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.type} onChange={(event) => handleTypeChange(event.target.value)}>
                <option value="mcq">MCQ</option>
                <option value="qa">Q&A</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Duration (minutes)</span>
              <input type="number" min="1" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.duration} onChange={(event) => setField('duration', event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Start Time</span>
              <input type="datetime-local" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.startTime} onChange={(event) => setField('startTime', event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">End Time</span>
              <input type="datetime-local" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.endTime} onChange={(event) => setField('endTime', event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Total Marks</span>
              <input type="number" min="1" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.totalMarks} onChange={(event) => setField('totalMarks', event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Number of Questions</span>
              <input type="number" min="1" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={form.numberOfQuestions} onChange={(event) => handleQuestionCountChange(event.target.value)} />
            </label>
          </div>
          <div className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            Marks per question: {marksPerQuestion === null ? 'Enter marks divisible by question count' : formatMarks(marksPerQuestion)}
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Question {index + 1}</h2>
                {form.type === 'mixed' && (
                  <select className="rounded-md border border-gray-300 px-3 py-2" value={question.type} onChange={(event) => updateQuestion(index, { type: event.target.value, options: event.target.value === 'mcq' ? ['', ''] : [] })}>
                    <option value="mcq">MCQ</option>
                    <option value="qa">Q&A</option>
                  </select>
                )}
              </div>
              <textarea className="w-full rounded-md border border-gray-300 px-3 py-2" rows={3} placeholder="Question text" value={question.questionText} onChange={(event) => updateQuestion(index, { questionText: event.target.value })} />
              {question.type === 'mcq' && (
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <input key={optionIndex} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder={`Option ${optionIndex + 1}`} value={option} onChange={(event) => updateOption(index, optionIndex, event.target.value)} />
                  ))}
                  <button type="button" onClick={() => addOption(index)} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Add option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isLoading} className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400">
            {isLoading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeacherCreateAssignment;
