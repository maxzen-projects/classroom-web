import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { ROUTES } from '../routes';
import { UPLOADS_BASE_URL } from '../redux/baseApi';
import { useGetSchoolQuery } from '../redux/schoolApi';
import ThemeSwitcher from './ThemeSwitcher';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const getDashboardRoute = () => {
    if (!user) return ROUTES.LOGIN;

    switch (user.role) {
      case 'student':
        return ROUTES.STUDENT_DASHBOARD;
      case 'teacher':
        return ROUTES.TEACHER_DASHBOARD;
      case 'admin':
        return ROUTES.ADMIN_DASHBOARD;
      case 'super_admin':
        return ROUTES.SUPER_ADMIN_DASHBOARD;
      default:
        return ROUTES.LOGIN;
    }
  };

  const resolveLogoUrl = (logo) => {
    if (!logo) return null;
    if (/^https?:\/\//i.test(logo) || logo.startsWith('data:')) return logo;
    return `${UPLOADS_BASE_URL}${logo.startsWith('/') ? logo : `/${logo}`}`;
  };

  const schoolRef = user?.school?._id || user?.school || user?.schoolId;
  const { data: school } = useGetSchoolQuery(schoolRef, { skip: !schoolRef });
  const schoolLogoUrl = useMemo(
    () => resolveLogoUrl(school?.logo || user?.school?.logo),
    [school?.logo, user?.school?.logo]
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-card backdrop-blur theme-transition">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleSidebar}
              className="theme-transition rounded-full border border-border bg-card p-2 text-text-muted hover:border-primary hover:bg-primary-soft hover:text-primary lg:hidden"
            >
              <FaBars className="h-5 w-5" />
            </button>
            
            <Link to={getDashboardRoute()} className="flex items-center gap-3">
              <div>
                <img
                  src={schoolLogoUrl || logo}
                  alt={school?.name || 'Classroom LMS'}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = logo;
                  }}
                />
              </div>
              <div>
                <span className="block text-base font-semibold text-text">{school?.name || 'Classroom LMS'}</span>
                <span className="block text-xs text-text-muted">School operations and learning</span>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeSwitcher />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((current) => !current)}
                className="theme-transition flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-text hover:border-primary hover:bg-primary-soft"
              >
                {user?.profileImage ? (
                  <img
                    src={`${UPLOADS_BASE_URL}${user.profileImage}`}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-card">
                    <FaUser className="h-4 w-4" />
                  </div>
                )}
                <div className="hidden text-left lg:block">
                  <span className="block text-sm font-medium text-text">{user?.name}</span>
                  <span className="block text-xs capitalize text-text-muted">{user?.role}</span>
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-card-hover">
                  <div className="rounded-xl bg-card-alt px-3 py-3">
                    <p className="text-sm font-semibold text-text">{user?.name}</p>
                    <p className="text-xs capitalize text-text-muted">{user?.role}</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link
                      to={
                        user?.role === 'student'
                          ? ROUTES.STUDENT_PROFILE
                          : user?.role === 'teacher'
                            ? ROUTES.TEACHER_PROFILE
                            : user?.role === 'admin'
                              ? ROUTES.ADMIN_PROFILE
                              : '#'
                      }
                      className="theme-transition block rounded-xl px-3 py-2 text-sm text-text hover:bg-card-alt"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="theme-transition flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-text hover:bg-danger-soft hover:text-danger"
                    >
                      <FaSignOutAlt className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="theme-transition rounded-full border border-border bg-card p-2 text-text hover:border-primary hover:bg-primary-soft"
            >
              {isMobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="space-y-3">
              <div className="rounded-2xl bg-card-alt px-4 py-3">
                <p className="text-sm font-semibold text-text">{user?.name}</p>
                <p className="text-xs capitalize text-text-muted">{user?.role}</p>
              </div>

              <ThemeSwitcher compact />

              <Link
                to={
                  user?.role === 'student'
                    ? ROUTES.STUDENT_PROFILE
                    : user?.role === 'teacher'
                      ? ROUTES.TEACHER_PROFILE
                      : user?.role === 'admin'
                        ? ROUTES.ADMIN_PROFILE
                        : '#'
                }
                className="theme-transition block rounded-2xl border border-border bg-card px-4 py-3 text-sm text-text hover:bg-card-alt"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile Settings
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="theme-transition flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-text hover:bg-danger-soft hover:text-danger"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
