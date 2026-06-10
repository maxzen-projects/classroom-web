import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery,
  tagTypes: ['Attendance'],
  endpoints: (builder) => ({
    getClassAttendance: builder.query({
      query: ({ classId, date }) => `/attendance/class/${classId}/date/${date}`,
      providesTags: ['Attendance'],
    }),
    markClassAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance/mark-class',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    updateClassAttendance: builder.mutation({
      query: ({ classId, date, ...body }) => ({
        url: `/attendance/class/${classId}/date/${date}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getStudentAttendance: builder.query({
      query: ({ month, year, studentId }) => {
        const params = new URLSearchParams({ month, year, studentId });
        return `/attendance/student?${params.toString()}`;
      },
      providesTags: ['Attendance'],
    }),
    getMonthlyReport: builder.query({
      query: (params) => `/attendance/report?${new URLSearchParams(params)}`,
      providesTags: ['Attendance'],
    }),
    getAttendanceClasses: builder.query({
      query: () => '/attendance/classes',
    }),
    getAttendanceStudents: builder.query({
      query: (classId) => `/attendance/students?classId=${classId}`,
    }),
    // Admin attendance endpoints
    getAdminAttendanceStats: builder.query({
      query: ({ date, schoolId }) => {
        const params = new URLSearchParams();
        if (date) params.set('date', date);
        if (schoolId) params.set('schoolId', schoolId);
        return `/attendance/admin/stats?${params.toString()}`;
      },
    }),
    getAdminAttendanceCalendar: builder.query({
      query: ({ month, year, schoolId }) => {
        const params = new URLSearchParams();
        if (month) params.set('month', month);
        if (year) params.set('year', year);
        if (schoolId) params.set('schoolId', schoolId);
        return `/attendance/admin/calendar?${params.toString()}`;
      },
    }),
    // Individual attendance marking for students
    markIndividualAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance/mark',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetClassAttendanceQuery,
  useMarkClassAttendanceMutation,
  useUpdateClassAttendanceMutation,
  useGetStudentAttendanceQuery,
  useGetMonthlyReportQuery,
  useGetAttendanceClassesQuery,
  useGetAttendanceStudentsQuery,
  useGetAdminAttendanceStatsQuery,
  useGetAdminAttendanceCalendarQuery,
  useMarkIndividualAttendanceMutation,
} = attendanceApi;
