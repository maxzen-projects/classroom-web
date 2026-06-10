import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const assignmentApi = createApi({
  reducerPath: 'assignmentApi',
  baseQuery,
  tagTypes: ['Assignment', 'Submission'],
  endpoints: (builder) => ({
    getAssignments: builder.query({
      query: () => '/assignments',
      providesTags: ['Assignment', 'Submission'],
    }),
    createAssignment: builder.mutation({
      query: (body) => ({
        url: '/assignments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Assignment'],
    }),
    startSubmission: builder.mutation({
      query: (body) => ({
        url: '/submissions/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Submission'],
    }),
    submitAssignment: builder.mutation({
      query: (body) => ({
        url: '/submissions/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Assignment', 'Submission'],
    }),
    getSubmissions: builder.query({
      query: (assignmentId) => `/submissions/${assignmentId}`,
      providesTags: ['Submission'],
    }),
    evaluateSubmission: builder.mutation({
      query: (body) => ({
        url: '/submissions/evaluate',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Submission'],
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useStartSubmissionMutation,
  useSubmitAssignmentMutation,
  useGetSubmissionsQuery,
  useEvaluateSubmissionMutation,
} = assignmentApi;
