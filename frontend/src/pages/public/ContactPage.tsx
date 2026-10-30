import React from 'react';
import { MapPin, Phone, Mail, Clock, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="py-14 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800 uppercase tracking-wider mb-2 inline-block">
            {t('contactUs')}
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Hospital Contact & Emergency Assistance
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-600">
            For urgent health inquiries, doctor appointments, and administrative support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border border-gray-200 rounded-lg p-6 bg-slate-50/50 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              General Inquiries & Appointments
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900">Hospital Location:</span>
                  <span>{t('hospitalAddress')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900">Reception & Booking Desk:</span>
                  <span>{t('hospitalPhone')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900">Email Assistance:</span>
                  <span>appointments@stmaryhospital.org</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-red-200 rounded-lg p-6 bg-red-50/40 space-y-4">
            <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              Emergency Care & Casualty
            </h2>

            <p className="text-xs text-slate-700 leading-relaxed">
              Our 24-hour Emergency Department provides immediate trauma and critical care response with dedicated ambulances.
            </p>

            <div className="p-4 bg-white rounded border border-red-200 text-center">
              <span className="text-xs text-red-600 font-semibold block uppercase">24/7 Casualty Hotline</span>
              <span className="text-lg font-extrabold text-red-700 block mt-0.5">+91 44 2855 9999</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Available 24 hours, 7 days a week, 365 days a year</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

