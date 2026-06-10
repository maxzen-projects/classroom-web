import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, ROLES } from '../routes';
import { useGetSchoolQuery } from '../redux/schoolApi';
import { UPLOADS_BASE_URL } from '../redux/baseApi';
import defaultLogo from '../assets/logo.jpg';

const SPLASH_DURATION_MS = 3000;

const dashboardByRole = {
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.TEACHER]: ROUTES.TEACHER_DASHBOARD,
  [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
  [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_DASHBOARD
};

const getId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

const resolveLogoUrl = (logo) => {
  if (!logo) return defaultLogo;
  if (/^https?:\/\//i.test(logo) || logo.startsWith('data:')) return logo;
  return `${UPLOADS_BASE_URL}${logo.startsWith('/') ? logo : `/${logo}`}`;
};

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const schoolId = getId(user?.schoolId) || getId(user?.school);

  const { data: school, isFetching } = useGetSchoolQuery(schoolId, {
    skip: !schoolId
  });

  const targetRoute = dashboardByRole[user?.role] || ROUTES.LOGIN;
  const schoolName = school?.name || user?.school?.name || user?.schoolCollege || 'Welcome';
  const logoUrl = useMemo(
    () => resolveLogoUrl(school?.logo || user?.school?.logo),
    [school?.logo, user?.school?.logo]
  );

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setIsVisible(true), 50);
    const redirectTimer = window.setTimeout(() => {
      navigate(targetRoute, { replace: true });
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [navigate, targetRoute]);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_42%,#fef3c7_100%)] px-6 text-slate-950">
      <div
        className={`relative flex w-full max-w-md flex-col items-center text-center transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full border border-slate-200 bg-white p-3 shadow-2xl shadow-cyan-900/15 sm:h-44 sm:w-44">
          <img
            src={logoUrl}
            alt={`${schoolName} logo`}
            className="h-full w-full rounded-full object-contain"
            onError={(event) => {
              event.currentTarget.src = defaultLogo;
            }}
          />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase text-cyan-700">
          Welcome to
        </p>
        <h1 className="max-w-full text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">
          {schoolName}
        </h1>

        <div className="mt-10 flex items-center gap-3 text-sm font-medium text-slate-700">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-700" />
          {isFetching ? 'Loading school profile' : 'Preparing your dashboard'}
        </div>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-cyan-700"
            style={{ animation: `splash-progress ${SPLASH_DURATION_MS}ms linear forwards` }}
          />
        </div>
      </div>

      <style>
        {`
          @keyframes splash-progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}
      </style>
    </div>
  );
};

export default SplashScreen;
