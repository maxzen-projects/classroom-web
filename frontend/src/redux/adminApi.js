import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['User', 'Dashboard'],
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Dashboard']
    }),
    getStudents: builder.query({
      query: ({ page = 1, limit = 10, search = '', status = 'all' }) => ({
        url: `/admin/students?page=${page}&limit=${limit}&search=${search}&status=${status}`,
      }),
      providesTags: ['User'],
    }),
    getTeachers: builder.query({
      query: ({ page = 1, limit = 10, search = '', status = 'all' }) => ({
        url: `/admin/teachers?page=${page}&limit=${limit}&search=${search}&status=${status}`,
      }),
      providesTags: ['User'],
    }),
    getUserDetails: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: ['User'],
    }),
    blockUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/block`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    unblockUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/unblock`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetStudentsQuery,
  useGetTeachersQuery,
  useGetUserDetailsQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeleteUserMutation,
} = adminApi;
