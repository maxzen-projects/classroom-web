import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const externalExamsApi = createApi({
  reducerPath: 'externalExamsApi',
  baseQuery,
  tagTypes: ['ExternalExam', 'ExamMark'],
  endpoints: (builder) => ({
    getExams: builder.query({
      query: () => '/external-exams',
      providesTags: ['ExternalExam', 'ExamMark'],
    }),
    getExamById: builder.query({
      query: (id) => `/external-exams/${id}`,
      providesTags: (result, error, id) => [{ type: 'ExternalExam', id }],
    }),
    createExam: builder.mutation({
      query: (body) => ({
        url: '/external-exams',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExternalExam'],
    }),
    updateExam: builder.mutation({
      query: ({ id, body }) => ({
        url: `/external-exams/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExternalExam'],
    }),
    deleteExam: builder.mutation({
      query: (id) => ({
        url: `/external-exams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExternalExam', 'ExamMark'],
    }),
    getExamMarks: builder.query({
      query: (examId) => `/external-exams/${examId}/marks`,
      providesTags: ['ExamMark'],
    }),
    getStudentMarks: builder.query({
      query: (studentId) => `/external-exams/student/${studentId}`,
      providesTags: ['ExamMark'],
    }),
    addExamMark: builder.mutation({
      query: (body) => ({
        url: '/external-exams/marks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamMark'],
    }),
    deleteExamMark: builder.mutation({
      query: (id) => ({
        url: `/external-exams/marks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamMark'],
    }),
    getStudentPerformance: builder.query({
      query: (studentId) => `/external-exams/performance/${studentId}`,
      providesTags: ['ExternalExam', 'ExamMark', 'Assignment', 'Submission', 'Attendance'],
    }),
  }),
});

export const {
  useGetExamsQuery,
  useGetExamByIdQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetExamMarksQuery,
  useGetStudentMarksQuery,
  useAddExamMarkMutation,
  useDeleteExamMarkMutation,
  useGetStudentPerformanceQuery,
} = externalExamsApi;
