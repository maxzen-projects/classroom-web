import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const studentsApi = createApi({
  reducerPath: 'studentsApi',
  baseQuery,
  tagTypes: ['Students', 'Classes'],
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: () => '/students',
      providesTags: ['Students']
    }),
    createStudent: builder.mutation({
      query: (data) => ({
        url: '/students',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Students']
    }),
    updateStudent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/students/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Students']
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/students/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Students']
    }),
    assignClass: builder.mutation({
      query: ({ id, classId }) => ({
        url: `/students/${id}/assign-class`,
        method: 'PATCH',
        body: { classId }
      }),
      invalidatesTags: ['Students', 'Classes']
    }),
    getClasses: builder.query({
      query: () => '/classes',
      providesTags: ['Classes']
    })
  }),
});

export const {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAssignClassMutation,
  useGetClassesQuery,
} = studentsApi;