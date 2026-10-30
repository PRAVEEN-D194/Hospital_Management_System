import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {t('hospitalName')}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Committed to providing compassionate, high-quality, and accessible healthcare to our patients.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{t('emergency')}: 24/7 Available</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">{t('home')}</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-white transition-colors">{t('doctors')}</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">{t('about')}</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">{t('contact')}</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Patient Registration</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Patient Sign In</Link>
              </li>
              <li>
                <Link to="/doctor/login" className="hover:text-white transition-colors">Doctor Sign In</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              {t('contactUs')}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span>{t('hospitalAddress')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{t('hospitalPhone')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>appointments@stmaryhospital.org</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t('hospitalName')}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

