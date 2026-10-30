import React from 'react';
import { HeartPulse, Award, Users, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="py-14 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800 uppercase tracking-wider mb-2 inline-block">
            About Our Institution
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dedicated to Modern, Compassionate Healthcare
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            St. Mary Multispeciality Hospital has been providing comprehensive healthcare services with a focus on clinical excellence, patient dignity, and ethical standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 rounded-lg p-6 bg-slate-50/50">
            <Award className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">Clinical Excellence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipped with modern diagnostics, dedicated surgical suites, and specialized intensive care units.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-slate-50/50">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">Patient-Centric Care</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We design every clinical interaction to minimize wait times, preserve privacy, and foster patient trust.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-slate-50/50">
            <ShieldCheck className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">Ethical Standards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent consultation fees, secure digital patient records, and uncompromised medical safety.
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <h2 className="text-base font-bold text-slate-900 mb-3">Our Medical Departments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
            <div className="p-2.5 bg-gray-50 rounded border border-gray-100">• Department of Cardiology</div>
            <div className="p-2.5 bg-gray-50 rounded border border-gray-100">• Department of Dermatology</div>
            <div className="p-2.5 bg-gray-50 rounded border border-gray-100">• Department of Orthopedics</div>
            <div className="p-2.5 bg-gray-50 rounded border border-gray-100">• Department of Neurology</div>
            <div className="p-2.5 bg-gray-50 rounded border border-gray-100">• Department of Pediatrics</div>
            <div className="p-2.5 bg-gray-50 rounded border border-gray-100">• Department of General Medicine</div>
          </div>
        </div>
      </div>
    </div>
  );
};

