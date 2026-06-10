import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery,
  endpoints: (builder) => ({
    getTeacherAnalytics: builder.query({
      query: () => ({
        url: '/analytics/teacher',
        method: 'GET',
      }),
    }),
    getAdminAnalytics: builder.query({
      query: () => ({
        url: '/analytics/admin',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetTeacherAnalyticsQuery,
  useGetAdminAnalyticsQuery,
} = analyticsApi;