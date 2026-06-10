import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ROUTES, ROLES } from './routes';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';

// Route Protection
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import PermissionProtectedRoute from './components/PermissionProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentSubjects from './pages/StudentSubjects';
import StudentSubject from './pages/StudentSubject';
import StudentChapter from './pages/StudentChapter';
import StudentLesson from './pages/StudentLesson';
import StudentRecordedVideos from './pages/StudentRecordedVideos';
import StudentLiveClasses from './pages/StudentLiveClasses';
import StudentAnalytics from './pages/StudentAnalytics';
import StudentSchedule from './pages/StudentSchedule';
import StudentProfile from './pages/StudentProfile';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentFees from './pages/StudentFees';
import AssignmentPage from './pages/AssignmentPage';
import AttendancePage from './pages/AttendancePage';
import StudentTimetable from './pages/StudentTimetable';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherSubjectManage from './pages/TeacherSubjectManage';
import TeacherCreateSubject from './pages/TeacherCreateSubject';
import TeacherCreateChapter from './pages/TeacherCreateChapter';
import TeacherUploadLesson from './pages/TeacherUploadLesson';
import TeacherUploadNotes from './pages/TeacherUploadNotes';
import TeacherScheduleLiveClass from './pages/TeacherScheduleLiveClass';
import TeacherProfile from './pages/TeacherProfile';
import TeacherSubjects from './pages/TeacherSubjects';
import TeacherSubjectDetail from './pages/TeacherSubjectDetail';
import TeacherChapterDetail from './pages/TeacherChapterDetail';
import TeacherStudents from './pages/TeacherStudents';
import TeacherStudentFees from './pages/TeacherStudentFees';
import TeacherLiveClasses from './pages/TeacherLiveClasses';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherCreateAssignment from './pages/TeacherCreateAssignment';
import TeacherEvaluate from './pages/TeacherEvaluate';
import TeacherTimetable from './pages/TeacherTimetable';
import TeacherExams from './pages/TeacherExams';
import ExamDetails from './pages/ExamDetails';

// Student Pages
import StudentAcademics from './pages/StudentAcademics';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAttendanceDashboard from './pages/AdminAttendanceDashboard';
import AdminManageStudents from './pages/AdminManageStudents';
import AdminManageTeachers from './pages/AdminManageTeachers';
import AdminManageLiveClasses from './pages/AdminManageLiveClasses';
import AdminManageReports from './pages/AdminManageReports';
import AdminProfile from './pages/AdminProfile';
import ManageClasses from './pages/ManageClasses';
import FeeManagement from './pages/FeeManagement';
import ManageSubjects from './pages/ManageSubjects';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageSchools from './pages/ManageSchools';
import AdminTimetable from './pages/AdminTimetable';
import AccessManagement from './pages/AccessManagement';

// Layout Component
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg text-text theme-transition">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-bg lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
};

// Redirect based on user role
const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case ROLES.STUDENT:
      return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
    case ROLES.TEACHER:
      return <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />;
    case ROLES.ADMIN:
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    case ROLES.SUPER_ADMIN:
      return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SPLASH} element={
            <ProtectedRoute>
              <SplashScreen />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

          {/* Protected Routes with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <RoleBasedRedirect />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path={ROUTES.STUDENT_DASHBOARD} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_SUBJECTS} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentSubjects />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_SUBJECT} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentSubject />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_CHAPTER} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentChapter />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_LESSON} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentLesson />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_RECORDED_VIDEOS} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentRecordedVideos />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_LIVE_CLASSES} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentLiveClasses />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_ANALYTICS} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentAnalytics />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_SCHEDULE} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentSchedule />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_PROFILE} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentProfile />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_ACADEMICS} element={
            <ProtectedRoute>
              <AppLayout>
                <StudentAcademics />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_EDIT_STUDENT_PROFILE} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <StudentProfile />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_FEES} element={
            <PermissionProtectedRoute requiredPermission="fees">
              <AppLayout>
                <StudentFees />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_ASSIGNMENTS} element={
            <PermissionProtectedRoute requiredPermission="assignments">
              <AppLayout>
                <AssignmentPage />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_ATTENDANCE} element={
            <PermissionProtectedRoute requiredPermission="attendance">
              <AppLayout>
                <StudentAttendancePage />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_TIMETABLE} element={
            <PermissionProtectedRoute requiredPermission="timetable">
              <AppLayout>
                <StudentTimetable />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_LIVE_CLASSES} element={
            <PermissionProtectedRoute requiredPermission="live-classes">
              <AppLayout>
                <StudentLiveClasses />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.STUDENT_ANALYTICS} element={
            <PermissionProtectedRoute requiredPermission="performance">
              <AppLayout>
                <StudentAnalytics />
              </AppLayout>
            </PermissionProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path={ROUTES.TEACHER_DASHBOARD} element={
            <PermissionProtectedRoute requiredPermission="dashboard">
              <AppLayout>
                <TeacherDashboard />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_ANALYTICS} element={
            <PermissionProtectedRoute requiredPermission="analytics">
              <AppLayout>
                <TeacherAnalytics />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_STUDENT_FEES} element={
            <PermissionProtectedRoute requiredPermission="fees">
              <AppLayout>
                <TeacherStudentFees />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_ATTENDANCE} element={
            <PermissionProtectedRoute requiredPermission="attendance">
              <AppLayout>
                <AttendancePage />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_TIMETABLE} element={
            <PermissionProtectedRoute requiredPermission="timetable">
              <AppLayout>
                <TeacherTimetable />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_ASSIGNMENTS} element={
            <PermissionProtectedRoute requiredPermission="assignments">
              <AppLayout>
                <TeacherAssignments />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_LIVE_CLASSES} element={
            <PermissionProtectedRoute requiredPermission="live-classes">
              <AppLayout>
                <TeacherLiveClasses />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_EXAMS} element={
            <PermissionProtectedRoute requiredPermission="exams">
              <AppLayout>
                <TeacherExams />
              </AppLayout>
            </PermissionProtectedRoute>
          } />
          {/* Keep remaining teacher routes as RoleProtectedRoute for now */}
          <Route path={ROUTES.TEACHER_SUBJECT_MANAGE} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherSubjectManage />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_CREATE_SUBJECT} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherCreateSubject />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_CREATE_CHAPTER} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherCreateChapter />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_UPLOAD_LESSON} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherUploadLesson />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_UPLOAD_NOTES} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherUploadNotes />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_SCHEDULE_LIVE_CLASS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherScheduleLiveClass />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_PROFILE} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherProfile />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_SUBJECTS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherSubjects />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_SUBJECT_DETAIL} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherSubjectDetail />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_CHAPTER_DETAIL} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherChapterDetail />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_STUDENTS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherStudents />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_CREATE_ASSIGNMENT} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherCreateAssignment />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_EVALUATE_ASSIGNMENTS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <AppLayout>
                <TeacherEvaluate />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.TEACHER_EXAM_DETAILS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
              <AppLayout>
                <ExamDetails />
              </AppLayout>
            </RoleProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_ANALYTICS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <AdminAnalytics />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_MANAGE_STUDENTS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <AdminManageStudents />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_MANAGE_TEACHERS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <AdminManageTeachers />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_MANAGE_LIVE_CLASSES} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <AdminManageLiveClasses />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_MANAGE_REPORTS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <AdminManageReports />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_MANAGE_SUBJECTS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <ManageSubjects />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_MANAGE_FEES} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <FeeManagement />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_PROFILE} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AppLayout>
                <AdminProfile />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_ATTENDANCE} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <AdminAttendanceDashboard />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_TIMETABLE} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <AdminTimetable />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_MANAGE_CLASSES} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <ManageClasses />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.ADMIN_ACCESS_MANAGEMENT} element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <AccessManagement />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.SUPER_ADMIN_DASHBOARD} element={
            <RoleProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <SuperAdminDashboard />
              </AppLayout>
            </RoleProtectedRoute>
          } />
          <Route path={ROUTES.SUPER_ADMIN_MANAGE_SCHOOLS} element={
            <RoleProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AppLayout>
                <ManageSchools />
              </AppLayout>
            </RoleProtectedRoute>
          } />
        </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
