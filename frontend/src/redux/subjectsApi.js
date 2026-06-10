import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

// 📌 RTK Query API for Subject Assignments
// Manages: Class → Subjects with Teacher Assignment
export const subjectsApi = createApi({
  reducerPath: 'subjectsApi',
  baseQuery,
  tagTypes: ['Subjects'],
  endpoints: (builder) => ({
    // 🔹 GET: Fetch all subjects for a specific class
    getSubjects: builder.query({
      query: (classId) => ({
        url: '/subject-assignments',
        params: { classId }
      }),
      providesTags: ['Subjects'],
      // ✅ Only run if classId is provided
      skip: (classId) => !classId
    }),

    // 🔹 POST: Create a new subject in a class with teacher assignment
    createSubject: builder.mutation({
      query: (data) => ({
        url: '/subject-assignments',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Subjects']
    }),

    // 🔹 PUT: Update subject (name or teacher)
    updateSubject: builder.mutation({
      query: ({ id, data }) => ({
        url: `/subject-assignments/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Subjects']
    }),

    // 🔹 DELETE: Remove subject from class
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/subject-assignments/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Subjects']
    })
  }),
});

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation
} = subjectsApi;