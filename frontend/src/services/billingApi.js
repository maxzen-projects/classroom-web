import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/billing`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['FeeStructure', 'ExtraFee', 'Bill', 'Payment', 'Analytics'],
  endpoints: (builder) => ({
    // ==================== FEE STRUCTURES ====================
    createFeeStructure: builder.mutation({
      query: (data) => ({
        url: '/fee-structures',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['FeeStructure', 'Analytics']
    }),

    getFeeStructures: builder.query({
      query: ({ classId, feeType, isActive } = {}) => {
        const params = new URLSearchParams();
        if (classId) params.append('classId', classId);
        if (feeType) params.append('feeType', feeType);
        if (isActive !== undefined) params.append('isActive', isActive);
        return `/fee-structures?${params}`;
      },
      providesTags: ['FeeStructure']
    }),

    getFeeStructureById: builder.query({
      query: (id) => `/fee-structures/${id}`,
      providesTags: ['FeeStructure']
    }),

    updateFeeStructure: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/fee-structures/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['FeeStructure', 'Analytics']
    }),

    deleteFeeStructure: builder.mutation({
      query: (id) => ({
        url: `/fee-structures/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['FeeStructure', 'Analytics']
    }),

    // ==================== EXTRA FEES ====================
    createExtraFee: builder.mutation({
      query: (data) => ({
        url: '/extra-fees',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['ExtraFee', 'Analytics']
    }),

    getExtraFees: builder.query({
      query: ({ name, isActive } = {}) => {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (isActive !== undefined) params.append('isActive', isActive);
        return `/extra-fees?${params}`;
      },
      providesTags: ['ExtraFee']
    }),

    updateExtraFee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/extra-fees/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['ExtraFee', 'Analytics']
    }),

    deleteExtraFee: builder.mutation({
      query: (id) => ({
        url: `/extra-fees/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['ExtraFee', 'Analytics']
    }),

    // ==================== BILLS ====================
    getStudentBills: builder.query({
      query: ({ studentId, classId, status, billMonth, billYear, page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        if (studentId) params.append('studentId', studentId);
        if (classId) params.append('classId', classId);
        if (status) params.append('status', status);
        if (billMonth) params.append('billMonth', billMonth);
        if (billYear) params.append('billYear', billYear);
        params.append('page', page);
        params.append('limit', limit);
        return `/bills?${params}`;
      },
      providesTags: ['Bill']
    }),

    getBillById: builder.query({
      query: (id) => `/bills/${id}`,
      providesTags: ['Bill']
    }),

    updateBill: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/bills/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Bill', 'Analytics']
    }),

    generateMonthlyBills: builder.mutation({
      query: (data) => ({
        url: '/bills/generate/manual',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Bill', 'Analytics']
    }),

    // ==================== PAYMENTS ====================
    recordPayment: builder.mutation({
      query: ({ billId, ...data }) => ({
        url: `/bills/${billId}/payments`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Bill', 'Payment', 'Analytics']
    }),

    getPaymentHistory: builder.query({
      query: ({ billId, studentId, startDate, endDate, page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        if (billId) params.append('billId', billId);
        if (studentId) params.append('studentId', studentId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('page', page);
        params.append('limit', limit);
        return `/payments?${params}`;
      },
      providesTags: ['Payment']
    }),

    // ==================== ANALYTICS ====================
    getBillingDashboard: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/analytics/dashboard?${params}`;
      },
      providesTags: ['Analytics']
    }),

    getPendingDues: builder.query({
      query: ({ classId, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        if (classId) params.append('classId', classId);
        params.append('limit', limit);
        return `/analytics/pending-dues?${params}`;
      },
      providesTags: ['Analytics']
    }),

    getLateFeesReport: builder.query({
      query: ({ limit = 20 } = {}) => {
        const params = new URLSearchParams();
        params.append('limit', limit);
        return `/analytics/late-fees?${params}`;
      },
      providesTags: ['Analytics']
    }),

    checkLateFees: builder.mutation({
      query: (data) => ({
        url: '/late-fees/check',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Bill', 'Analytics']
    })
  })
});

export const {
  // Fee Structures
  useCreateFeeStructureMutation,
  useGetFeeStructuresQuery,
  useGetFeeStructureByIdQuery,
  useUpdateFeeStructureMutation,
  useDeleteFeeStructureMutation,
  // Extra Fees
  useCreateExtraFeeMutation,
  useGetExtraFeesQuery,
  useUpdateExtraFeeMutation,
  useDeleteExtraFeeMutation,
  // Bills
  useGetStudentBillsQuery,
  useGetBillByIdQuery,
  useUpdateBillMutation,
  useGenerateMonthlyBillsMutation,
  // Payments
  useRecordPaymentMutation,
  useGetPaymentHistoryQuery,
  // Analytics
  useGetBillingDashboardQuery,
  useGetPendingDuesQuery,
  useGetLateFeesReportQuery,
  useCheckLateFeesMutation
} = billingApi;
