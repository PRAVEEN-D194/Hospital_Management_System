import React, { useEffect, useState } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { getErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Appointment, Doctor } from '../../types';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  RotateCcw,
} from 'lucide-react';

export const MyAppointmentsPage: React.FC = () => {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsMap, setDoctorsMap] = useState<Record<number, Doctor>>({});
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00:00');
  const [newEndTime, setNewEndTime] = useState('09:30:00');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Cancel state
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchAppointments = async () => {
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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    if (!cancelModalAppt) return;
    try {
      setCancelLoading(true);
      await appointmentService.cancelAppointment(cancelModalAppt.appointment_id);
      setCancelModalAppt(null);
      await fetchAppointments();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalAppt) return;

    try {
      setRescheduleLoading(true);
      setRescheduleError(null);
      await appointmentService.rescheduleAppointment(rescheduleModalAppt.appointment_id, {
        appointment_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
      });
      setRescheduleModalAppt(null);
      await fetchAppointments();
    } catch (err) {
      setRescheduleError(getErrorMessage(err));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'upcoming') {
      return a.appointment_status === 'confirmed' || a.appointment_status === 'pending';
    }
    if (activeTab === 'completed') {
      return a.appointment_status === 'completed';
    }
    return a.appointment_status === 'cancelled' || a.appointment_status === 'rejected';
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">{t('myAppointments')}</h1>
        <p className="text-xs text-slate-500 mt-1">Review scheduled visits, past history, and cancellation requests.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'upcoming'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('upcomingTab')} ({appointments.filter((a) => a.appointment_status === 'confirmed' || a.appointment_status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('completedTab')} ({appointments.filter((a) => a.appointment_status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'cancelled'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('cancelledTab')} ({appointments.filter((a) => a.appointment_status === 'cancelled' || a.appointment_status === 'rejected').length})
        </button>
      </div>

      {/* Content list */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-10 border border-dashed border-gray-200 rounded-lg text-center bg-white text-xs text-slate-500">
          {t('noAppointments')}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appt) => {
            const doc = doctorsMap[appt.doctor_id];
            const isUpcoming = appt.appointment_status === 'confirmed' || appt.appointment_status === 'pending';

            return (
              <div
                key={appt.appointment_id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">
                      {doc ? doc.full_name : `Doctor ID ${appt.doctor_id}`}
                    </span>
                    <span className="text-xs text-blue-600 font-medium">({doc?.specialization})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {appt.appointment_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}
                    </span>
                    {doc && (
                      <span className="font-medium text-slate-700">
                        Fee: ₹{Number(doc.consultation_fee).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {appt.reason_for_visit && (
                    <p className="text-xs text-slate-500 mt-1.5 italic">
                      Reason: {appt.reason_for_visit}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      appt.appointment_status === 'confirmed'
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

                  {isUpcoming && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => {
                          setRescheduleModalAppt(appt);
                          setNewDate(appt.appointment_date);
                          setNewStartTime(appt.start_time);
                          setNewEndTime(appt.end_time);
                        }}
                        className="px-2.5 py-1 text-xs border border-gray-300 rounded text-slate-700 hover:bg-gray-50 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reschedule
                      </button>

                      <button
                        onClick={() => setCancelModalAppt(appt)}
                        className="px-2.5 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <strong>{doctorsMap[cancelModalAppt.doctor_id]?.full_name}</strong> on{' '}
              {cancelModalAppt.appointment_date}?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalAppt(null)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs text-slate-700 hover:bg-gray-50"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleCancel}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Reschedule Consultation</h3>
              <button onClick={() => setRescheduleModalAppt(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleReschedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Appointment Date *</label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={newStartTime.slice(0, 5)}
                    onChange={(e) => setNewStartTime(`${e.target.value}:00`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={newEndTime.slice(0, 5)}
                    onChange={(e) => setNewEndTime(`${e.target.value}:00`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-slate-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {rescheduleLoading ? 'Updating...' : 'Save New Timing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

