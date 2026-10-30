import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { getErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Doctor, DoctorSchedule, Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
} from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(() => {
    const param = searchParams.get('doctor_id');
    return param ? parseInt(param, 10) : null;
  });

  const [appointmentDate, setAppointmentDate] = useState<string>(() => {
    const today = new Date();
    // Default to tomorrow
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });

  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  const [reasonForVisit, setReasonForVisit] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);

  // 1. Fetch active doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const docs = await doctorService.getDoctors(true);
        setDoctors(docs);
        if (selectedDoctorId && docs.some((d) => d.doctor_id === selectedDoctorId)) {
          setStep(2);
        }
      } catch (err) {
        setError('Failed to load active doctors list.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Fetch schedules and calculate slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !appointmentDate) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setError(null);
      setSelectedSlot(null);

      try {
        // Calculate weekday: JS 0 is Sunday, 1 is Monday ... 6 is Saturday
        // Backend day_of_week: 0 is Monday, ..., 6 is Sunday
        const dateObj = new Date(appointmentDate + 'T00:00:00');
        const jsDay = dateObj.getDay();
        const backendDayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

        const [docSchedules, appts] = await Promise.all([
          doctorService.getDoctorSchedules(selectedDoctorId, backendDayOfWeek, true),
          appointmentService.getAllAppointments({
            doctor_id: selectedDoctorId,
            appointment_date: appointmentDate,
          }).catch(() => []), // Admin/Doctor endpoint or fallback
        ]);

        setSchedules(docSchedules);
        setExistingAppointments(appts.filter((a) => a.appointment_status !== 'cancelled' && a.appointment_status !== 'rejected'));

        // Generate discrete slots
        const slots: { start: string; end: string }[] = [];

        docSchedules.forEach((sched) => {
          const duration = sched.slot_duration_minutes || 30;

          // Parse start and end times
          const [startH, startM] = sched.start_time.split(':').map(Number);
          const [endH, endM] = sched.end_time.split(':').map(Number);

          let currentMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;

          while (currentMinutes + duration <= endMinutes) {
            const nextMinutes = currentMinutes + duration;

            const formatTime = (mins: number) => {
              const h = Math.floor(mins / 60).toString().padStart(2, '0');
              const m = (mins % 60).toString().padStart(2, '0');
              return `${h}:${m}:00`;
            };

            const slotStart = formatTime(currentMinutes);
            const slotEnd = formatTime(nextMinutes);

            // Check if slot conflicts with existing appointment
            const isBooked = appts.some(
              (a) =>
                a.appointment_status !== 'cancelled' &&
                a.appointment_status !== 'rejected' &&
                a.start_time < slotEnd &&
                a.end_time > slotStart
            );

            if (!isBooked) {
              slots.push({ start: slotStart, end: slotEnd });
            }

            currentMinutes = nextMinutes;
          }
        });

        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error generating slots', err);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  const selectedDoctor = doctors.find((d) => d.doctor_id === selectedDoctorId) || null;

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !appointmentDate || !selectedSlot) {
      setError('Please select a doctor, appointment date, and time slot.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const created = await appointmentService.bookAppointment({
        doctor_id: selectedDoctorId,
        appointment_date: appointmentDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        reason_for_visit: reasonForVisit.trim() ? reasonForVisit.trim() : null,
        booking_source: 'web',
      });

      setBookingSuccess(created);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8 text-center shadow-2xs">
        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t('bookingSuccess')}</h1>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
          Your appointment has been confirmed with {selectedDoctor?.full_name} for{' '}
          <strong className="text-slate-900">{bookingSuccess.appointment_date}</strong> at{' '}
          <strong className="text-slate-900">{bookingSuccess.start_time.slice(0, 5)}</strong>.
        </p>

        <div className="mt-6 p-4 bg-slate-50 border border-gray-200 rounded text-left text-xs space-y-2 max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-500">Appointment ID:</span>
            <span className="font-bold text-slate-900">#{bookingSuccess.appointment_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Doctor:</span>
            <span className="font-bold text-slate-900">{selectedDoctor?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department:</span>
            <span className="font-bold text-slate-900">{selectedDoctor?.specialization}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consultation Fee:</span>
            <span className="font-bold text-slate-900">₹{Number(selectedDoctor?.consultation_fee).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/patient/appointments"
            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            Go to My Appointments
          </Link>
          <button
            onClick={() => {
              setBookingSuccess(null);
              setStep(1);
              setSelectedSlot(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-slate-700 hover:bg-gray-50 transition-colors"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900">{t('bookingTitle')}</h1>
        <p className="text-xs text-slate-500 mt-1">Reserve an in-person consultation with an experienced physician</p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-between text-xs border-y border-gray-200 py-3">
          <div className={`font-semibold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            1. Doctor
          </div>
          <span className="text-gray-300">→</span>
          <div className={`font-semibold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            2. Date & Time
          </div>
          <span className="text-gray-300">→</span>
          <div className={`font-semibold ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            3. Confirm
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Select Doctor */}
        {step === 1 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">{t('selectDoctor')}</h2>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading doctors...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.doctor_id;
                  return (
                    <div
                      key={doc.doctor_id}
                      onClick={() => setSelectedDoctorId(doc.doctor_id)}
                      className={`p-4 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">{doc.full_name}</span>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            ₹{Number(doc.consultation_fee).toFixed(0)}
                          </span>
                        </div>
                        <p className="text-blue-600 font-medium">{doc.specialization}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Fee: ₹{Number(doc.consultation_fee).toFixed(2)}</span>
                        {isSelected && (
                          <span className="text-blue-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={!selectedDoctorId}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                Proceed to Date & Slots <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Date & Time Slot */}
        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="text-xs">
                <span className="text-slate-500">Selected Specialist:</span>
                <span className="font-bold text-slate-900 ml-2">{selectedDoctor?.full_name}</span>
                <span className="text-blue-600 ml-2">({selectedDoctor?.specialization})</span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Change
              </button>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Select Appointment Date *
              </label>
              <input
                type="date"
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Slot selection */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Available Time Slots for {appointmentDate} *
              </label>

              {slotsLoading ? (
                <div className="py-8 text-center text-xs text-gray-400">Checking doctor schedules...</div>
              ) : schedules.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  Doctor is not scheduled for consultations on this day of the week. Please select another date.
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded text-xs text-slate-600">
                  {t('noSlotsAvailable')}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded border text-xs font-semibold text-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white border-gray-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/40'
                        }`}
                      >
                        {slot.start.slice(0, 5)} - {slot.end.slice(0, 5)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reason for visit */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Reason for Consultation (Optional)
              </label>
              <textarea
                rows={2}
                maxLength={500}
                placeholder="Briefly describe symptoms or primary purpose of visit..."
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-slate-700 rounded text-xs font-medium hover:bg-gray-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                Review Summary <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Confirm */}
        {step === 3 && (
          <div className="mt-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-900">Review & Confirm Your Reservation</h2>

            <div className="border border-gray-200 rounded-lg p-5 bg-slate-50/60 divide-y divide-gray-200 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-900">{selectedDoctor?.full_name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Specialization:</span>
                <span className="font-semibold text-slate-800">{selectedDoctor?.specialization}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Appointment Date:</span>
                <span className="font-bold text-slate-900">{appointmentDate}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Time Window:</span>
                <span className="font-bold text-blue-700">
                  {selectedSlot?.start.slice(0, 5)} - {selectedSlot?.end.slice(0, 5)}
                </span>
              </div>
              {reasonForVisit && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Reason:</span>
                  <span className="font-medium text-slate-800 text-right">{reasonForVisit}</span>
                </div>
              )}
              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Consultation Fee:</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{Number(selectedDoctor?.consultation_fee).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              * Payment is payable at the hospital registration counter upon arrival. Please arrive 10 minutes prior to your consultation slot.
            </p>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-slate-700 rounded text-xs font-medium hover:bg-gray-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Modify Selection
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmBooking}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {loading ? 'Confirming with Hospital...' : t('confirmBookingBtn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

