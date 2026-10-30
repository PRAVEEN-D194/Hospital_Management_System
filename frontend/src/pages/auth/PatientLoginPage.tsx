import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { HeartPulse, AlertCircle, LogIn } from 'lucide-react';

export const PatientLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await authService.patientLogin(phone.trim(), password);
      login(res);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white mx-auto mb-3">
          <HeartPulse className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('patientLoginTitle')}</h1>
        <p className="text-xs text-slate-500 mt-1">Sign in with your registered phone number</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('phone')} *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('password')} *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : t('login')}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2 text-center text-xs text-slate-600">
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            {t('noAccount')}
          </Link>
          <div className="flex justify-center gap-3 pt-2 text-[11px] text-slate-400">
            <Link to="/doctor/login" className="hover:text-slate-600">Doctor Portal</Link>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-slate-600">Admin Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

