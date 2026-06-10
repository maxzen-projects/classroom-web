import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const teacherApi = createApi({
  reducerPath: 'teacherApi',
  baseQuery,
  tagTypes: ['TeacherSubjects', 'TeacherStudents', 'TeacherClasses', 'Chapters', 'Lessons'],
  endpoints: (builder) => ({
    // Teacher Subjects
    getTeacherSubjects: builder.query({
      query: () => '/teacher/subjects',
      providesTags: ['TeacherSubjects']
    }),

    // Teacher Students
    getTeacherStudents: builder.query({
      query: () => '/teacher/students',
      providesTags: ['TeacherStudents']
    }),

    getTeacherClasses: builder.query({
      query: () => '/teacher/classes',
      providesTags: ['TeacherClasses']
    }),

    // Chapters
    createChapter: builder.mutation({
      query: (data) => ({
        url: '/teacher/chapters',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Chapters']
    }),

    getChapters: builder.query({
      query: (subjectId) => `/teacher/chapters/${subjectId}`,
      providesTags: ['Chapters']
    }),

    updateChapter: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teacher/chapters/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Chapters']
    }),

    deleteChapter: builder.mutation({
      query: (id) => ({
        url: `/teacher/chapters/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Chapters']
    }),

    // Lessons
    createLesson: builder.mutation({
      query: (data) => ({
        url: '/teacher/lessons',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Lessons']
    }),

    getLessons: builder.query({
      query: (chapterId) => `/teacher/lessons/${chapterId}`,
      providesTags: ['Lessons']
    }),

    updateLesson: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teacher/lessons/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Lessons']
    }),

    deleteLesson: builder.mutation({
      query: (id) => ({
        url: `/teacher/lessons/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Lessons']
    }),
    uploadLessonFile: builder.mutation({
      query: ({ chapterId, formData }) => ({
        url: `/teacher/lessons/${chapterId}/upload`,
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['Lessons']
    })
  })
});

export const {
  useGetTeacherSubjectsQuery,
  useGetTeacherStudentsQuery,
  useGetTeacherClassesQuery,
  useCreateChapterMutation,
  useGetChaptersQuery,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useCreateLessonMutation,
  useGetLessonsQuery,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useUploadLessonFileMutation
} = teacherApi;
