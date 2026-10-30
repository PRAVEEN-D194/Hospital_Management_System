import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import type { Appointment, Doctor } from '../../types';
import { Calendar, CalendarPlus, CheckCircle2, Clock, Bell, User, ArrowRight } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsMap, setDoctorsMap] = useState<Record<number, Doctor>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appts, docs] = await Promise.all([
          appointmentService.getMyAppointments(),
          doctorService.getDoctors(false),
        ]);
        setAppointments(appts);

        const map: Record<number, Doctor> = {};
        docs.forEach((d) => {
          map[d.doctor_id] = d;
        });
        setDoctorsMap(map);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingAppts = appointments.filter(
    (a) => a.appointment_status === 'confirmed' || a.appointment_status === 'pending'
  );
  const nextAppt = upcomingAppts[0] || null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your doctor consultations and medical appointments.
            </p>
          </div>
          <Link
            to="/patient/book"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <CalendarPlus className="w-4 h-4" />
            {t('bookAppointment')}
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Upcoming Consultations</span>
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{upcomingAppts.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Active appointments</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Booking History</span>
            <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{appointments.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">All consultations logged</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Next Scheduled Visit</span>
            <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2 truncate">
            {nextAppt ? `${nextAppt.appointment_date} at ${nextAppt.start_time.slice(0, 5)}` : 'None upcoming'}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
            {nextAppt && doctorsMap[nextAppt.doctor_id] ? doctorsMap[nextAppt.doctor_id].full_name : 'Ready to book'}
          </span>
        </div>
      </div>

      {/* Recent Appointments Preview */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Appointments</h2>
          <Link to="/patient/appointments" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            You have no appointments booked yet. Click below to schedule a visit.
            <div className="mt-3">
              <Link to="/patient/book" className="text-blue-600 font-semibold hover:underline">
                Book an Appointment
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.slice(0, 5).map((appt) => {
              const doc = doctorsMap[appt.doctor_id];
              return (
                <div key={appt.appointment_id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {doc ? doc.full_name : `Doctor ID ${appt.doctor_id}`}
                    </h3>
                    <p className="text-slate-500 mt-0.5">
                      {doc?.specialization} • Date: {appt.appointment_date} • Time: {appt.start_time.slice(0, 5)}
                    </p>
                    {appt.reason_for_visit && (
                      <p className="text-slate-400 mt-0.5 italic">Reason: {appt.reason_for_visit}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${appt.appointment_status === 'confirmed'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : appt.appointment_status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : appt.appointment_status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}
                    >
                      {appt.appointment_status}
                    </span>
                    <Link
                      to="/patient/appointments"
                      className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
