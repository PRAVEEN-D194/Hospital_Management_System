import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  HeartPulse,
  LayoutDashboard,
  CalendarPlus,
  Calendar,
  Bell,
  User as UserIcon,
  Stethoscope,
  Clock,
  Users,
  PhoneCall,
  LogOut,
  Menu,
  X,
  Globe,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const patientNav = [
    { name: t('dashboard'), path: '/patient/dashboard', icon: LayoutDashboard },
    { name: t('bookAppointment'), path: '/patient/book', icon: CalendarPlus },
    { name: t('myAppointments'), path: '/patient/appointments', icon: Calendar },
    { name: t('notifications'), path: '/patient/notifications', icon: Bell },
    { name: t('myProfile'), path: '/patient/profile', icon: UserIcon },
  ];

  const doctorNav = [
    { name: t('dashboard'), path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'My Schedule', path: '/doctor/schedules', icon: Clock },
    { name: 'Doctor Profile', path: '/doctor/profile', icon: UserIcon },
  ];

  const adminNav = [
    { name: t('dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Doctor Schedules', path: '/admin/schedules', icon: Clock },
    { name: 'Patients', path: '/admin/patients', icon: Users },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Voice Call Logs', path: '/admin/calls', icon: PhoneCall },
  ];

  const navLinks = role === 'patient' ? patientNav : role === 'doctor' ? doctorNav : adminNav;

  const roleBadgeColor =
    role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : role === 'doctor'
      ? 'bg-teal-100 text-teal-800 border-teal-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <div className="min-h-screen flex bg-gray-50 text-slate-800">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className="h-16 px-5 border-b border-gray-200 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                St. Mary Hospital
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-900 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info mini-card */}
          <div className="p-4 border-b border-gray-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</p>
                <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${roleBadgeColor} uppercase tracking-wider`}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-slate-900 md:hidden rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-900 capitalize">
              {role} {t('dashboard')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center bg-gray-100 rounded-md p-1 border border-gray-200 text-xs">
              <Globe className="w-3.5 h-3.5 text-gray-500 ml-1 mr-1.5" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  language === 'en' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  language === 'ta' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            <Link
              to="/"
              className="text-xs font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded transition-colors hidden sm:block"
            >
              Back to Website
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

