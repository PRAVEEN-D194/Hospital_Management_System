import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import type { Doctor, DoctorSchedule } from '../../types';
import { Calendar, Clock, ArrowLeft, Stethoscope, CheckCircle2 } from 'lucide-react';

export const DoctorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, role } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const docId = parseInt(id, 10);
        const [docData, schedData] = await Promise.all([
          doctorService.getDoctorById(docId),
          doctorService.getDoctorSchedules(docId, undefined, true),
        ]);
        setDoctor(docData);
        setSchedules(schedData);
      } catch (err) {
        setError('Failed to load doctor profile or schedule details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const bookLink = isAuthenticated && role === 'patient' ? `/patient/book?doctor_id=${id}` : '/login';

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-gray-500">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-4">
          {error || 'Doctor not found.'}
        </div>
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Doctors List
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Doctors Directory
        </Link>

        {/* Doctor Main Header Card */}
        <div className="border border-gray-200 rounded-lg p-6 bg-slate-50/50 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shrink-0">
                {doctor.full_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{doctor.full_name}</h1>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{doctor.specialization}</p>
                <p className="text-xs text-slate-500 mt-1">St. Mary Multispeciality Hospital</p>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-200">
              <span className="text-xs text-slate-500 block">Consultation Fee</span>
              <span className="text-lg font-extrabold text-slate-900 block">
                ₹{Number(doctor.consultation_fee).toFixed(2)}
              </span>
              <Link
                to={bookLink}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Working Hours & Consultation Schedule */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Consultation Schedule & Available Hours
            </h2>
          </div>

          {schedules.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 bg-gray-50 rounded border border-gray-100">
              No regular schedule published yet for this doctor. Please contact hospital reception.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedules.map((s) => (
                <div key={s.schedule_id} className="p-3.5 rounded border border-gray-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {daysOfWeek[s.day_of_week] || `Day ${s.day_of_week}`}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {s.slot_duration_minutes} min slots
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
