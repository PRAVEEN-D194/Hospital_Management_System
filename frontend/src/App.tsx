import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { DoctorsPage } from './pages/public/DoctorsPage';
import { DoctorDetailsPage } from './pages/public/DoctorDetailsPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { PatientLoginPage } from './pages/auth/PatientLoginPage';
import { PatientRegisterPage } from './pages/auth/PatientRegisterPage';
import { DoctorLoginPage } from './pages/auth/DoctorLoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// Patient Portal Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BookAppointmentPage } from './pages/patient/BookAppointmentPage';
import { MyAppointmentsPage } from './pages/patient/MyAppointmentsPage';
import { NotificationsPage } from './pages/patient/NotificationsPage';
import { ProfilePage } from './pages/patient/ProfilePage';

// Doctor Portal Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage';
import { DoctorSchedulePage } from './pages/doctor/DoctorSchedulePage';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageDoctorsPage } from './pages/admin/ManageDoctorsPage';
import { ManageSchedulesPage } from './pages/admin/ManageSchedulesPage';
import { ManagePatientsPage } from './pages/admin/ManagePatientsPage';
import { ManageAppointmentsPage } from './pages/admin/ManageAppointmentsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { VoiceCallLogsPage } from './pages/admin/VoiceCallLogsPage';

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<PatientLoginPage />} />
              <Route path="/register" element={<PatientRegisterPage />} />
              <Route path="/doctor/login" element={<DoctorLoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* Patient Portal Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<BookAppointmentPage />} />
              <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
              <Route path="/patient/notifications" element={<NotificationsPage />} />
              <Route path="/patient/profile" element={<ProfilePage />} />
            </Route>

            {/* Doctor Portal Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
              <Route path="/doctor/schedules" element={<DoctorSchedulePage />} />
              <Route path="/doctor/profile" element={<DoctorProfilePage />} />
            </Route>

            {/* Admin Portal Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/doctors" element={<ManageDoctorsPage />} />
              <Route path="/admin/schedules" element={<ManageSchedulesPage />} />
              <Route path="/admin/patients" element={<ManagePatientsPage />} />
              <Route path="/admin/appointments" element={<ManageAppointmentsPage />} />
              <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
              <Route path="/admin/calls" element={<VoiceCallLogsPage />} />
            </Route>

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
