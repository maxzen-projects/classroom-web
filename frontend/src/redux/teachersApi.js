import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const teachersApi = createApi({
  reducerPath: 'teachersApi',
  baseQuery,
  tagTypes: ['Teachers', 'Classes'],
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: () => '/teachers',
      providesTags: ['Teachers']
    }),
    createTeacher: builder.mutation({
      query: (data) => ({
        url: '/teachers',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Teachers']
    }),
    updateTeacher: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teachers/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Teachers']
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Teachers']
    }),
    assignClasses: builder.mutation({
      query: ({ id, classIds }) => ({
        url: `/teachers/${id}/assign-classes`,
        method: 'PATCH',
        body: { classIds }
      }),
      invalidatesTags: ['Teachers', 'Classes']
    }),
    getClasses: builder.query({
      query: () => '/classes',
      providesTags: ['Classes']
    })
  }),
});

export const {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useAssignClassesMutation,
  useGetClassesQuery,
} = teachersApi;