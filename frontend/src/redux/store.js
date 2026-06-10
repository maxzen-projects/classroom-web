import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { academicApi } from './academicApi';
import { studentsApi } from './studentsApi';
import { teachersApi } from './teachersApi';
import { teacherApi } from './teacherApi';
import { profileApi } from './profileApi';
import { adminApi } from './adminApi';
import { superAdminApi } from './superAdminApi';
import { schoolApi } from './schoolApi';
import { subjectsApi } from './subjectsApi';
import { attendanceApi } from './attendanceApi';
import { feeApi } from './feeApi';
import { assignmentApi } from './assignmentApi';
import { timetableApi } from './timetableApi';
import { analyticsApi } from './analyticsApi';
import { externalExamsApi } from './externalExamsApi';
import { billingApi } from '../services/billingApi';
import { permissionsApi } from './permissionsApi';
import permissionsReducer from './permissionsSlice';

export const store = configureStore({
  reducer: {
    permissions: permissionsReducer,
    [authApi.reducerPath]: authApi.reducer,
    [academicApi.reducerPath]: academicApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [teachersApi.reducerPath]: teachersApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [schoolApi.reducerPath]: schoolApi.reducer,
    [subjectsApi.reducerPath]: subjectsApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [feeApi.reducerPath]: feeApi.reducer,
    [assignmentApi.reducerPath]: assignmentApi.reducer,
    [timetableApi.reducerPath]: timetableApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [externalExamsApi.reducerPath]: externalExamsApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      academicApi.middleware,
      studentsApi.middleware,
      teachersApi.middleware,
      teacherApi.middleware,
      profileApi.middleware,
      adminApi.middleware,
      superAdminApi.middleware,
      schoolApi.middleware,
      subjectsApi.middleware,
      attendanceApi.middleware,
      feeApi.middleware,
      assignmentApi.middleware,
      timetableApi.middleware,
      analyticsApi.middleware,
      externalExamsApi.middleware,
      billingApi.middleware,
      permissionsApi.middleware,
    ),
});
