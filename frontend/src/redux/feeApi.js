import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const feeApi = createApi({
  reducerPath: 'feeApi',
  baseQuery,
  tagTypes: ['Fee'],
  endpoints: (builder) => ({
    getFees: builder.query({
      query: (params) => ({
        url: '/fees',
        params,
      }),
      providesTags: ['Fee'],
    }),
    getFeeById: builder.query({
      query: (id) => `/fees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Fee', id }],
    }),
    recordPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/fees/${id}/pay`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Fee'],
    }),
    updateFee: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/fees/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Fee'],
    }),
    generateReport: builder.query({
      query: (params) => ({
        url: '/fees/report',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetFeeByIdQuery,
  useRecordPaymentMutation,
  useUpdateFeeMutation,
  useLazyGenerateReportQuery,
} = feeApi;
