import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const timetableApi = createApi({
  reducerPath: 'timetableApi',
  baseQuery,
  tagTypes: ['Timetable', 'PeriodAttendance', 'PeriodSummary'],
  endpoints: (builder) => ({
    getClassTimetable: builder.query({
      query: (classId) => `/timetable/classes/${classId}`,
      providesTags: ['Timetable'],
    }),
    getMyTimetable: builder.query({
      query: () => '/timetable/my',
      providesTags: ['Timetable'],
    }),
    getTeacherTodayPeriods: builder.query({
      query: (date) => {
        const params = new URLSearchParams();
        if (date) params.set('date', date);
        return `/timetable/teacher/today?${params.toString()}`;
      },
      providesTags: ['Timetable', 'PeriodAttendance'],
    }),
    saveTimetablePeriod: builder.mutation({
      query: (body) => ({
        url: '/timetable/periods',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Timetable'],
    }),
    deleteTimetablePeriod: builder.mutation({
      query: (periodId) => ({
        url: `/timetable/periods/${periodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Timetable'],
    }),
    getPeriodAttendance: builder.query({
      query: ({ periodId, date }) => `/timetable/periods/${periodId}/attendance?${new URLSearchParams({ date })}`,
      providesTags: ['PeriodAttendance'],
    }),
    markPeriodAttendance: builder.mutation({
      query: ({ periodId, ...body }) => ({
        url: `/timetable/periods/${periodId}/attendance`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PeriodAttendance', 'PeriodSummary'],
    }),
    getPeriodAttendanceSummary: builder.query({
      query: (params = {}) => `/timetable/attendance/summary?${new URLSearchParams(params)}`,
      providesTags: ['PeriodSummary'],
    }),
  }),
});

export const {
  useGetClassTimetableQuery,
  useGetMyTimetableQuery,
  useGetTeacherTodayPeriodsQuery,
  useSaveTimetablePeriodMutation,
  useDeleteTimetablePeriodMutation,
  useGetPeriodAttendanceQuery,
  useMarkPeriodAttendanceMutation,
  useGetPeriodAttendanceSummaryQuery,
} = timetableApi;
