import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery,
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/super-admin/dashboard'
    }),
  }),
});

export const { useGetDashboardStatsQuery } = superAdminApi;
