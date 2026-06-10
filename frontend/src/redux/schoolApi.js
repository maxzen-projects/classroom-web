import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const schoolApi = createApi({
  reducerPath: 'schoolApi',
  baseQuery,
  tagTypes: ['School'],
  endpoints: (builder) => ({
    getSchools: builder.query({
      query: () => '/schools',
      providesTags: (result) =>
        result
          ? [
              ...result.map((school) => ({ type: 'School', id: school._id })),
              { type: 'School', id: 'LIST' }
            ]
          : [{ type: 'School', id: 'LIST' }]
    }),
    getSchool: builder.query({
      query: (id) => `/schools/${id}`,
      providesTags: (result, error, id) => [{ type: 'School', id }]
    }),
    createSchool: builder.mutation({
      query: (data) => ({
        url: '/schools',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'School', id: 'LIST' }]
    }),
    updateSchool: builder.mutation({
      query: ({ id, data }) => ({
        url: `/schools/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: [{ type: 'School', id: 'LIST' }]
    }),
    deleteSchool: builder.mutation({
      query: (id) => ({
        url: `/schools/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'School', id: 'LIST' }]
    }),
    assignAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/schools/${id}/assign-admin`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'School', id: 'LIST' }]
    })
  })
});

export const {
  useGetSchoolsQuery,
  useGetSchoolQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useAssignAdminMutation
} = schoolApi;
