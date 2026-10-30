import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, Doctor } from '../../types';
import { Calendar, Clock, CheckCircle2, UserCheck, Stethoscope } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const doctor = user as Doctor;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctor?.doctor_id) return;
      try {
        setLoading(true);
        const data = await appointmentService.getDoctorAppointments(doctor.doctor_id);
        setAppointments(data);
      } catch (err) {
        console.error('Failed to load doctor appointments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [doctor?.doctor_id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= todayStr && (a.appointment_status === 'confirmed' || a.appointment_status === 'pending')
  );

  return (
    <div className="space-y-6">
      {/* Doctor Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-lg shrink-0">
              {doctor?.full_name?.charAt(0) || 'D'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{doctor?.full_name}</h1>
              <p className="text-xs font-semibold text-teal-700 mt-0.5">{doctor?.specialization}</p>
              <p className="text-xs text-slate-500 mt-0.5">Consultation Fee: ₹{Number(doctor?.consultation_fee).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{todayAppointments.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{todayStr}</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Upcoming Total</span>
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{upcomingAppointments.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Active bookings</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Sessions</span>
            <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {appointments.filter((a) => a.appointment_status === 'completed').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Total completed</span>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-slate-900">Today's Appointment Schedule ({todayStr})</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading schedule...</div>
        ) : todayAppointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No consultations booked for today.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {todayAppointments.map((appt) => (
              <div key={appt.appointment_id} className="p-4 sm:px-6 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Patient ID #{appt.patient_id}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}
                  </span>
                  {appt.reason_for_visit && (
                    <span className="text-slate-400 italic block mt-0.5">
                      Reason: {appt.reason_for_visit}
                    </span>
                  )}
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                    appt.appointment_status === 'confirmed'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : appt.appointment_status === 'completed'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {appt.appointment_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

