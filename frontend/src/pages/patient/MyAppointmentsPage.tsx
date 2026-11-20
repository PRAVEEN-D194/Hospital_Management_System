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
  Stethoscope,
} from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
  is_available: boolean;
}

export const MyAppointmentsPage: React.FC = () => {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsMap, setDoctorsMap] = useState<Record<number, Doctor>>({});
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<TimeSlot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
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

  // Fetch slots whenever reschedule modal is open and date changes
  useEffect(() => {
    if (!rescheduleModalAppt || !newDate) return;

    let isMounted = true;
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setRescheduleError(null);
        setSelectedRescheduleSlot(null);

        const data = await appointmentService.getAvailableSlots(
          newDate,
          rescheduleModalAppt.doctor_id,
          rescheduleModalAppt.appointment_id
        );
        if (isMounted) {
          setRescheduleSlots(data.slots || []);
        }
      } catch (err) {
        if (isMounted) {
          setRescheduleSlots([]);
          setRescheduleError('No consultation schedule found for this date. Please select another date.');
        }
      } finally {
        if (isMounted) {
          setSlotsLoading(false);
        }
      }
    };

    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [newDate, rescheduleModalAppt]);

  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleModalAppt(appt);
    setNewDate(appt.appointment_date);
    setSelectedRescheduleSlot(null);
    setRescheduleSlots([]);
    setRescheduleError(null);
  };

  const handleCancel = async () => {
    if (!cancelModalAppt) return;
    try {
      setCancelLoading(true);
      await appointmentService.cancelAppointment(cancelModalAppt.appointment_id);
      const apptId = cancelModalAppt.appointment_id;
      setCancelModalAppt(null);
      setSuccessBanner(`Appointment #${apptId} has been successfully cancelled.`);
      await fetchAppointments();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalAppt) return;

    if (!newDate) {
      setRescheduleError('Please choose a consultation date.');
      return;
    }
    if (!selectedRescheduleSlot) {
      setRescheduleError('Please choose an available time slot button before confirming.');
      return;
    }
    if (!selectedRescheduleSlot.is_available) {
      setRescheduleError('The selected slot is already booked. Please choose an available time slot.');
      return;
    }

    try {
      setRescheduleLoading(true);
      setRescheduleError(null);

      await appointmentService.rescheduleAppointment(rescheduleModalAppt.appointment_id, {
        appointment_date: newDate,
        start_time: selectedRescheduleSlot.start,
        end_time: selectedRescheduleSlot.end,
      });

      const updatedId = rescheduleModalAppt.appointment_id;
      const updatedDate = newDate;
      const updatedSlotTime = `${selectedRescheduleSlot.start} - ${selectedRescheduleSlot.end}`;

      setRescheduleModalAppt(null);
      setSuccessBanner(`Appointment #${updatedId} successfully rescheduled to ${updatedDate} at ${updatedSlotTime}.`);
      await fetchAppointments();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setRescheduleError(msg);

      // Refresh slots on 409 conflict
      if (err.response?.status === 409) {
        try {
          const fresh = await appointmentService.getAvailableSlots(
            newDate,
            rescheduleModalAppt.doctor_id,
            rescheduleModalAppt.appointment_id
          );
          setRescheduleSlots(fresh.slots || []);
          setSelectedRescheduleSlot(null);
        } catch {
          // ignore
        }
      }
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

      {successBanner && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-green-600 hover:text-green-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
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
                        onClick={() => openRescheduleModal(appt)}
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

      {/* Reschedule Modal with Available Slots */}
      {rescheduleModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reschedule Consultation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a new date and choose an available consultation slot.
                </p>
              </div>
              <button
                onClick={() => setRescheduleModalAppt(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Appointment Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
              <span className="font-semibold text-slate-700 block uppercase tracking-wider text-[10px]">
                Current Appointment
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Assigned Doctor:</span>
                <span className="font-bold text-slate-900">
                  {doctorsMap[rescheduleModalAppt.doctor_id]?.full_name || `Doctor #${rescheduleModalAppt.doctor_id}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Current Timing:</span>
                <span className="font-semibold text-slate-800">
                  {rescheduleModalAppt.appointment_date} ({rescheduleModalAppt.start_time.slice(0, 5)} - {rescheduleModalAppt.end_time.slice(0, 5)})
                </span>
              </div>
            </div>

            {rescheduleError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              {/* New Date Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select New Consultation Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Available time slots will update automatically for this date.
                </span>
              </div>

              {/* Selected Slot Preview */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Selected New Slot</label>
                <div className="p-2.5 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-800">
                      {selectedRescheduleSlot
                        ? `${selectedRescheduleSlot.start} - ${selectedRescheduleSlot.end}`
                        : 'No slot selected (please select an available slot below)'}
                    </span>
                  </div>
                  {selectedRescheduleSlot && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold">
                      Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Available Time Slots as Selectable Buttons */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Available Consultation Slots for {newDate} <span className="text-red-500">*</span>
                </label>

                {slotsLoading ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Checking doctor availability and booked slots...
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded text-center text-gray-500">
                    No consultation slots are scheduled for this date. Please select another date.
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {rescheduleSlots.map((slot) => {
                        const isSelected = selectedRescheduleSlot?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            disabled={!slot.is_available}
                            onClick={() => {
                              setSelectedRescheduleSlot(slot);
                              setRescheduleError(null);
                            }}
                            className={`py-2 px-2.5 rounded text-xs font-medium border text-center transition-all ${
                              !slot.is_available
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                                : 'bg-white text-slate-800 border-gray-300 hover:border-blue-500 hover:bg-blue-50/50'
                            }`}
                          >
                            <span className="block font-semibold">{slot.start} - {slot.end}</span>
                            {!slot.is_available && (
                              <span className="block text-[9px] text-gray-400 font-normal no-underline mt-0.5">
                                Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-white border border-gray-300"></span> Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-blue-600"></span> Selected
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></span> Booked
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  className="px-3.5 py-2 border border-gray-300 rounded text-slate-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading || !selectedRescheduleSlot || slotsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {rescheduleLoading ? 'Updating Appointment...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
