import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const academicApi = createApi({
  reducerPath: 'academicApi',
  baseQuery,
  tagTypes: [
    'Class',
    'Teacher',
    'Subject',
    'SubjectAssignment',
    'Chapter',
    'Lesson',
    'LiveClass',
  ],
  endpoints: (builder) => ({
    getClasses: builder.query({
      query: () => '/classes',
      providesTags: ['Class'],
    }),
    createClass: builder.mutation({
      query: (data) => ({
        url: '/classes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation({
      query: ({ id, data }) => ({
        url: `/classes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Class'],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Class'],
    }),
    assignTeacher: builder.mutation({
      query: ({ id, teacherId }) => ({
        url: `/classes/${id}/assign-teacher`,
        method: 'PATCH',
        body: { teacherId },
      }),
      invalidatesTags: ['Class', 'Teacher'],
    }),
    getTeachers: builder.query({
      query: () => '/admin/teachers?limit=1000',
      providesTags: ['Teacher'],
    }),
    getSubjects: builder.query({
      query: () => '/subjects',
      providesTags: ['Subject'],
    }),
    getAllSubjects: builder.query({
      query: () => '/subjects/admin/all',
      providesTags: ['Subject'],
    }),
    createSubject: builder.mutation({
      query: (subjectData) => ({
        url: '/subjects',
        method: 'POST',
        body: subjectData,
      }),
      invalidatesTags: ['Subject'],
    }),
    getChapters: builder.query({
      query: (subjectId) => `/chapters/subject/${subjectId}`,
      providesTags: ['Chapter'],
    }),
    createChapter: builder.mutation({
      query: ({ subjectId, ...chapterData }) => ({
        url: `/chapters/subject/${subjectId}`,
        method: 'POST',
        body: chapterData,
      }),
      invalidatesTags: ['Chapter', 'Subject'],
    }),
    getLessonsForChapter: builder.query({
      query: (chapterId) => `/lessons/chapter/${chapterId}`,
      providesTags: ['Lesson'],
    }),
    createLesson: builder.mutation({
      query: ({ chapterId, ...lessonData }) => ({
        url: `/lessons/chapter/${chapterId}`,
        method: 'POST',
        body: lessonData,
      }),
      invalidatesTags: ['Lesson', 'Chapter'],
    }),
    updateLesson: builder.mutation({
      query: ({ id, ...lessonData }) => ({
        url: `/lessons/${id}`,
        method: 'PUT',
        body: lessonData,
      }),
      invalidatesTags: ['Lesson'],
    }),
    deleteLesson: builder.mutation({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lesson'],
    }),
    uploadLessonFile: builder.mutation({
      query: ({ chapterId, formData }) => ({
        url: `/lessons/chapter/${chapterId}/upload`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Lesson'],
    }),
    getLessonById: builder.query({
      query: (id) => `/lessons/${id}`,
      providesTags: ['Lesson'],
    }),
    getVideoLessons: builder.query({
      query: () => '/lessons/videos',
      providesTags: ['Lesson'],
    }),
    getLiveClasses: builder.query({
      query: () => '/live-classes',
      providesTags: ['LiveClass'],
    }),
    getAllLiveClasses: builder.query({
      query: () => '/live-classes/admin/all',
      providesTags: ['LiveClass'],
    }),
    getTeacherLiveClasses: builder.query({
      query: () => '/live-classes/teacher/my',
      providesTags: ['LiveClass'],
    }),
    createLiveClass: builder.mutation({
      query: (liveClassData) => ({
        url: '/live-classes',
        method: 'POST',
        body: liveClassData,
      }),
      invalidatesTags: ['LiveClass'],
    }),
    updateLiveClass: builder.mutation({
      query: ({ id, ...liveClassData }) => ({
        url: `/live-classes/${id}`,
        method: 'PUT',
        body: liveClassData,
      }),
      invalidatesTags: ['LiveClass'],
    }),
    deleteLiveClass: builder.mutation({
      query: (id) => ({
        url: `/live-classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LiveClass'],
    }),
    getStudentLiveClasses: builder.query({
      query: () => '/live-classes/student/my-classes',
      providesTags: ['LiveClass'],
    }),
    getLiveClassById: builder.query({
      query: (id) => `/live-classes/${id}`,
      providesTags: ['LiveClass'],
    }),
    joinLiveClass: builder.mutation({
      query: (id) => ({
        url: `/live-classes/${id}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['LiveClass'],
    }),
    updateLiveClassStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/live-classes/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['LiveClass'],
    }),
    adminDeleteLiveClass: builder.mutation({
      query: (id) => ({
        url: `/live-classes/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LiveClass'],
    }),
    getStudentClass: builder.query({
      query: () => '/classes/student/my-class',
      providesTags: ['Class'],
    }),
    getStudentSubjects: builder.query({
      query: () => '/subject-assignments/student/my-subjects',
      providesTags: ['SubjectAssignment'],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useAssignTeacherMutation,
  useGetTeachersQuery,
  useGetSubjectsQuery,
  useGetAllSubjectsQuery,
  useCreateSubjectMutation,
  useGetChaptersQuery,
  useLazyGetChaptersQuery,
  useCreateChapterMutation,
  useGetLessonsForChapterQuery,
  useLazyGetLessonsForChapterQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useUploadLessonFileMutation,
  useGetLessonByIdQuery,
  useGetVideoLessonsQuery,
  useGetLiveClassesQuery,
  useGetAllLiveClassesQuery,
  useGetTeacherLiveClassesQuery,
  useCreateLiveClassMutation,
  useUpdateLiveClassMutation,
  useDeleteLiveClassMutation,
  useGetStudentLiveClassesQuery,
  useGetLiveClassByIdQuery,
  useJoinLiveClassMutation,
  useUpdateLiveClassStatusMutation,
  useAdminDeleteLiveClassMutation,
  useGetStudentClassQuery,
  useGetStudentSubjectsQuery,
} = academicApi;
