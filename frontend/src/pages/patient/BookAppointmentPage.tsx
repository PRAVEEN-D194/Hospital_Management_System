import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { getErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import type { Doctor, Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Stethoscope,
  Phone,
  Mic,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MitraVoiceAgent } from '../../components/MitraVoiceAgent';

interface TimeSlot {
  start: string;
  end: string;
  is_available: boolean;
}

export const BookAppointmentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Single Doctor state
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);

  // Patient inputs
  const [patientName, setPatientName] = useState(user?.full_name || '');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState((user && 'phone' in user ? user.phone : '') || '');
  const [reasonForVisit, setReasonForVisit] = useState('');

  // Date & Slot state
  const [appointmentDate, setAppointmentDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [suggestedAlternatives, setSuggestedAlternatives] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Status & Confirmation
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictSuggestions, setConflictSuggestions] = useState<TimeSlot[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);

  // Voice assistant toggle
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  // 1. Fetch single configured doctor on mount
  useEffect(() => {
    const fetchDefaultDoctor = async () => {
      try {
        setDoctorLoading(true);
        const doc = await doctorService.getDefaultDoctor();
        setDoctor(doc);
      } catch (err) {
        setError('Failed to load doctor information. Please try again.');
      } finally {
        setDoctorLoading(false);
      }
    };
    fetchDefaultDoctor();
  }, []);

  // Update prefilled patient info when user context changes
  useEffect(() => {
    if (user) {
      if (!patientName) setPatientName(user.full_name || '');
      if (!patientPhone) setPatientPhone(('phone' in user ? user.phone : '') || '');
    }
  }, [user]);

  // 2. Fetch available slots whenever appointmentDate changes
  useEffect(() => {
    if (!appointmentDate) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setError(null);
        setSelectedSlot(null);
        setConflictSuggestions([]);

        const data = await appointmentService.getAvailableSlots(appointmentDate);
        setSlots(data.slots || []);
        setSuggestedAlternatives(data.suggested_alternatives || []);
        if (data.doctor && !doctor) {
          setDoctor(data.doctor as Doctor);
        }
      } catch (err) {
        console.error('Failed to load slots', err);
        setError('No consultation schedule found for this date. Please select another working date.');
        setSlots([]);
        setSuggestedAlternatives([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [appointmentDate]);

  // 3. Handle appointment submission
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      setError('Please enter patient name.');
      return;
    }
    if (!patientAge || parseInt(patientAge, 10) <= 0 || parseInt(patientAge, 10) > 125) {
      setError('Please enter a valid patient age.');
      return;
    }
    if (!patientPhone.trim()) {
      setError('Please enter contact phone number.');
      return;
    }
    if (!appointmentDate) {
      setError('Please choose an appointment date.');
      return;
    }
    if (!selectedSlot) {
      setError('Please select an available appointment time slot.');
      return;
    }
    if (!selectedSlot.is_available) {
      setError('The selected time slot is not available. Please choose an alternative slot.');
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);
      setConflictSuggestions([]);

      const created = await appointmentService.bookAppointment({
        doctor_id: doctor?.doctor_id,
        patient_name: patientName.trim(),
        patient_age: parseInt(patientAge, 10),
        patient_phone: patientPhone.trim(),
        appointment_date: appointmentDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        reason_for_visit: reasonForVisit.trim() ? reasonForVisit.trim() : null,
        booking_source: 'web',
      });

      setBookingSuccess(created);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);

      // Refresh slots on collision & highlight alternatives
      if (err.response?.status === 409) {
        try {
          const fresh = await appointmentService.getAvailableSlots(appointmentDate);
          setSlots(fresh.slots || []);
          setConflictSuggestions(fresh.suggested_alternatives || []);
        } catch {
          // ignore
        }
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // =================== BOOKING SUCCESS VIEW ===================
  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8 text-center shadow-2xs">
        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t('bookingSuccess')}</h1>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
          Your appointment has been confirmed with <strong>{doctor?.full_name}</strong> for{' '}
          <strong className="text-slate-900">{bookingSuccess.appointment_date}</strong> at{' '}
          <strong className="text-slate-900">{bookingSuccess.start_time.slice(0, 5)}</strong>.
        </p>

        <div className="mt-6 p-4 bg-slate-50 border border-gray-200 rounded text-left text-xs space-y-2.5 max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-500">Appointment ID:</span>
            <span className="font-bold text-slate-900">#{bookingSuccess.appointment_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Patient:</span>
            <span className="font-bold text-slate-900">{patientName} (Age: {patientAge})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Contact:</span>
            <span className="font-bold text-slate-900">{patientPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Doctor:</span>
            <span className="font-bold text-slate-900">{doctor?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Specialization:</span>
            <span className="font-bold text-slate-900">{doctor?.specialization}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consultation Fee:</span>
            <span className="font-bold text-slate-900">₹{Number(doctor?.consultation_fee || 0).toFixed(2)}</span>
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
              setSelectedSlot(null);
              setReasonForVisit('');
            }}
            className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-slate-700 hover:bg-gray-50 transition-colors"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  // =================== MAIN BOOKING FORM ===================
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Voice Booking Assistant Companion: Mitra */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-blue-950">Prefer Voice Assistance?</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Mitra AI</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Talk directly with Mitra to check doctor schedules, fees, or guidance before booking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs shrink-0 self-start sm:self-auto transition-colors"
          >
            {showVoiceAssistant ? (
              <>
                Hide Voice Assistant <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Talk to Mitra <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {showVoiceAssistant && (
          <div className="mt-4 pt-3 border-t border-blue-200/60">
            <MitraVoiceAgent />
          </div>
        )}
      </div>

      {/* Assigned Doctor Card Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {doctorLoading ? 'Loading physician...' : doctor?.full_name}
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Hospital Doctor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {doctor?.specialization} • Consultation Fee: ₹{Number(doctor?.consultation_fee || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 border border-gray-200 px-3 py-2 rounded-md shrink-0">
            <span className="block font-semibold text-slate-800">Single Doctor System</span>
            <span className="text-[11px] text-green-700 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Automatically Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Main Appointment Form */}
      <form onSubmit={handleConfirmBooking} className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{t('bookingTitle')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Please enter patient details and choose your preferred date and time slot.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {/* Conflict alternative slots */}
              {conflictSuggestions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <span className="font-semibold block mb-1.5 text-red-800">
                    Alternative Available Slots on this Date:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {conflictSuggestions.map((alt) => (
                      <button
                        key={alt.start}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(alt);
                          setError(null);
                        }}
                        className="px-2.5 py-1 bg-white border border-red-300 text-red-700 rounded text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        {alt.start}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 1: Patient Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-gray-100 pb-2">
            1. Patient Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="125"
                placeholder="e.g. 32"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Date & Available Time Slot */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-gray-100 pb-2">
            2. Consultation Date & Time Slot
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Select Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Slots are dynamically refreshed for the selected date.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Selected Time
              </label>
              <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-md text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800">
                    {selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : 'Please select a slot below'}
                  </span>
                </div>
                {selectedSlot && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-semibold">
                    Selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Available Consultation Slots for {appointmentDate}
            </label>

            {slotsLoading ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Checking doctor availability & schedule...
              </div>
            ) : slots.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 text-center">
                No consultation slots are scheduled for this date. Please choose another date.
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={!slot.is_available}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setError(null);
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
        </div>

        {/* SECTION 3: Reason for Visit (Optional) */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-slate-700">
            Reason for Visit / Symptoms (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Briefly describe health symptoms or medical concerns..."
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            className="w-full text-xs p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* SECTION 4: Summary & Confirm Button */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <span className="text-slate-400">Total Consultation Fee:</span>{' '}
            <strong className="text-base font-bold text-slate-900">
              ₹{Number(doctor?.consultation_fee || 0).toFixed(2)}
            </strong>
          </div>

          <button
            type="submit"
            disabled={bookingLoading || !selectedSlot}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            {bookingLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Confirming Appointment...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm Appointment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointmentPage;
