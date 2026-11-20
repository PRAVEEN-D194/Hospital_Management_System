import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { doctorService } from '../../services/doctorService';
import type { Doctor } from '../../types';
import { Stethoscope, Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight, Award, Mail, Phone } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultDoctor = async () => {
      try {
        setLoading(true);
        const data = await doctorService.getDefaultDoctor();
        setDoctor(data);
      } catch (err) {
        setError('Failed to load doctor profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDefaultDoctor();
  }, []);

  const bookLink = isAuthenticated && role === 'patient' ? '/patient/book' : '/login';

  return (
    <div className="py-12 bg-white min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-200 pb-6 text-center">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Hospital Medical Staff
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
            Our Consulting Physician
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Our hospital operates a dedicated single-doctor appointment system ensuring personalized, high-continuity care for every patient.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-gray-500">Loading doctor profile...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-xs text-red-600">
            {error}
          </div>
        ) : doctor ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            {/* Header banner */}
            <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-2xl shadow-xs shrink-0">
                  {doctor.full_name.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{doctor.full_name}</h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Practicing & Active
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 mt-1">{doctor.specialization}</p>
                  <p className="text-xs text-slate-500 mt-1">St. Mary Multispeciality Hospital</p>
                </div>
              </div>

              <Link
                to={bookLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Calendar className="w-4 h-4" />
                Book Consultation
              </Link>
            </div>

            {/* Details body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Professional Profile</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doctor.full_name} serves as our lead consulting physician, providing clinical evaluations, diagnostic reviews, preventative medicine, and specialized treatment regimens. With extensive clinical experience, every appointment is directly scheduled and managed with continuity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Consultation Hours
                    </div>
                    <p className="text-xs text-slate-600">Monday – Saturday: 09:00 AM – 06:00 PM</p>
                    <p className="text-xs text-slate-600">Sunday: 09:00 AM – 01:00 PM</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                      <Award className="w-4 h-4 text-blue-600" />
                      Consultation Fee
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      ₹{Number(doctor.consultation_fee).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-400">Payable at clinic desk or online confirmation</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Key Clinical Focus Areas:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Primary & Adult Medical Care
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Comprehensive Clinical Assessments
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Chronic Disease & Wellness Management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Diagnostic Coordination & Follow-ups
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Sidebar: Contact & System Notice */}
              <div className="space-y-4">
                <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Automatic Assignment
                  </div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    All patient appointments are automatically assigned to {doctor.full_name}. Simply provide your details, choose your date, and pick an available time slot.
                  </p>
                  <Link
                    to={bookLink}
                    className="block text-center py-2 px-3 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Booking
                  </Link>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg text-xs space-y-2 bg-white">
                  <span className="font-bold text-slate-800 block">Clinic Contact</span>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{doctor.phone}</span>
                  </div>
                  {doctor.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DoctorsPage;
