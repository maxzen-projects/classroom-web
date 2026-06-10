import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const permissionsApi = createApi({
  reducerPath: 'permissionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Permissions'],
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: (role) => ({
        url: `/permissions/${role}`,
        method: 'GET',
      }),
      providesTags: ['Permissions'],
    }),
    getAllPermissions: builder.query({
      query: () => ({
        url: '/permissions/all',
        method: 'GET',
      }),
      providesTags: ['Permissions'],
    }),
    updatePermissions: builder.mutation({
      query: ({ role, permissions }) => ({
        url: `/permissions/${role}`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: ['Permissions'],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetAllPermissionsQuery,
  useUpdatePermissionsMutation,
} = permissionsApi;
