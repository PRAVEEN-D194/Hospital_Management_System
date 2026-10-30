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
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedDoctors = async () => {
      try {
        const data = await doctorService.getDoctors(true);
        setDoctors(data.slice(0, 3)); // show top 3
      } catch (err) {
        console.error('Failed to load featured doctors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedDoctors();
  }, []);

  const specializations = [
    { name: 'Cardiology', icon: Heart, desc: 'Comprehensive heart care and diagnostic evaluations.' },
    { name: 'Dermatology', icon: Activity, desc: 'Specialized clinical skin, hair, and nail treatments.' },
    { name: 'Orthopedics', icon: Bone, desc: 'Joint reconstruction, sports medicine, and spine care.' },
    { name: 'Neurology', icon: Brain, desc: 'Advanced neurological disorders and stroke care.' },
    { name: 'Pediatrics', icon: Baby, desc: 'Dedicated healthcare for infants, children, and teens.' },
    { name: 'General Medicine', icon: Stethoscope, desc: 'Primary adult care, chronic illness, and prevention.' },
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
                {t('exploreDoctors')}
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
              <h3 className="text-base font-bold text-slate-900 mb-2">Expert Specialists</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consult with verified, experienced doctors committed to evidence-based healthcare.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Zero Waiting Time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose defined consultation time slots and avoid lengthy outpatient queues.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Multilingual Patient Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless booking in English and Tamil with dedicated telephone assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Available Specializations */}
      <section className="py-16 bg-slate-50/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('specializations')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Complete clinical care across major medical departments in our hospital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec) => {
              const Icon = spec.icon;
              return (
                <div key={spec.name} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{spec.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{spec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Doctors */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t('featuredDoctors')}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                Book a consultation with our experienced practitioners.
              </p>
            </div>
            <Link to="/doctors" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All Doctors <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg">
              No doctors listed at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div key={doc.doctor_id} className="border border-gray-200 rounded-lg p-5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                        {doc.full_name.charAt(0)}
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                        {t('active')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.full_name}</h3>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{doc.specialization}</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      {t('consultationFee')}: ₹{Number(doc.consultation_fee).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                    <Link
                      to={`/doctors/${doc.doctor_id}`}
                      className="flex-1 text-center py-2 px-3 text-xs font-medium border border-gray-300 rounded text-slate-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('viewDetails')}
                    </Link>
                    <Link
                      to={bookLink}
                      className="flex-1 text-center py-2 px-3 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {t('bookAppointment')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-16 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('howItWorks')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Simple 3-step online consultation reservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-base mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{t('step1Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-base mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{t('step2Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-base mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{t('step3Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
