import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { doctorService } from '../../services/doctorService';
import type { Doctor } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Baby,
  Activity,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefaultDoctor = async () => {
      try {
        const data = await doctorService.getDefaultDoctor();
        setDoctor(data);
      } catch (err) {
        console.error('Failed to load doctor', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaultDoctor();
  }, []);

  const specializations = [
    { name: 'General Medicine', icon: Stethoscope, desc: 'Primary adult care, chronic illness, and prevention.' },
    { name: 'Dermatology', icon: Activity, desc: 'Specialized clinical skin, hair, and nail treatments.' },
    { name: 'Cardiology Support', icon: Heart, desc: 'Comprehensive heart care and diagnostic evaluations.' },
    { name: 'Pediatrics', icon: Baby, desc: 'Dedicated healthcare for infants, children, and teens.' },
    { name: 'Neurology Review', icon: Brain, desc: 'Advanced neurological disorders and stroke care.' },
    { name: 'Orthopedics', icon: Bone, desc: 'Joint reconstruction, sports medicine, and spine care.' },
  ];

  const bookLink = isAuthenticated && role === 'patient' ? '/patient/book' : '/login';

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="bg-slate-50 border-b border-gray-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800 uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Trusted Hospital Care
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {t('heroSubtitle')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={bookLink}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                {t('bookAppointment')}
              </Link>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white border border-gray-300 text-slate-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Meet Our Doctor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hospital Introduction */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Dedicated Physician</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consult with our experienced hospital doctor committed to evidence-based healthcare and personalized patient recovery.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Seamless Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant slot reservation without tedious doctor selection. Simply choose your preferred date and convenient time slot.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Voice & Digital Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book online or speak with Mitra, our 24/7 AI Hospital Receptionist, in English or Tamil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clinical Services */}
      <section className="py-16 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Specializations & Services
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Comprehensive medical assessments and specialized therapeutic care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec) => {
              const Icon = spec.icon;
              return (
                <div key={spec.name} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{spec.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{spec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Single Consulting Doctor Spotlight */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Hospital Consulting Physician
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Consult With Our Doctor
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every appointment is automatically assigned to our hospital doctor for consistent, focused care.
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading doctor profile...</div>
            ) : doctor ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shrink-0">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{doctor.full_name}</h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{doctor.specialization}</p>
                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                      <p>Consultation Fee: <strong className="text-slate-800">₹{Number(doctor.consultation_fee).toFixed(2)}</strong></p>
                      <p>Weekly Schedule: <span className="text-slate-700 font-medium">Monday to Sunday</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
                  <Link
                    to="/doctors"
                    className="text-center px-4 py-2.5 text-xs font-medium border border-gray-300 rounded text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={bookLink}
                    className="text-center px-5 py-2.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 5. How It Works (Single Doctor Flow) */}
      <section className="py-16 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('howItWorks')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Fast, simple 3-step appointment booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Enter Patient Information</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide patient name, age, and phone number. No need to browse or compare multiple doctors.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Pick Date & Available Slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose any working day and select from live available 30-minute time slots.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Automatic Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The appointment is automatically assigned to our hospital doctor with immediate confirmation and reminder alerts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
