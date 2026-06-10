import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: (result) => {
        const userId = result?._id;
        return userId ? [{ type: 'User', id: userId }] : [{ type: 'User', id: 'current' }];
      },
    }),
    getProfileById: builder.query({
      query: (userId) => `/auth/profile/${userId}`,
      providesTags: (result) => {
        const id = result?._id;
        return id ? [{ type: 'User', id }] : [{ type: 'User', id: 'other' }];
      },
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    updateProfileById: builder.mutation({
      query: ({ userId, formData }) => ({
        url: `/auth/profile/${userId}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetProfileByIdQuery,
  useUpdateProfileMutation,
  useUpdateProfileByIdMutation,
} = profileApi;
