import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, AlertCircle, LogIn } from 'lucide-react';

export const DoctorLoginPage: React.FC = () => {
  const { login } = useAuth();
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
      const res = await authService.doctorLogin(phone.trim(), password);
      login(res);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-lg bg-teal-600 flex items-center justify-center text-white mx-auto mb-3">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Doctor Portal Sign In</h1>
        <p className="text-xs text-slate-500 mt-1">Authorized physicians & consulting practitioners</p>
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
            <label className="block font-semibold text-slate-700 mb-1">Registered Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In as Doctor'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-xs text-slate-500">
          <Link to="/login" className="text-blue-600 hover:underline">Patient Portal</Link>
          <Link to="/admin/login" className="text-blue-600 hover:underline">Admin Sign In</Link>
        </div>
      </div>
    </div>
  );
};

