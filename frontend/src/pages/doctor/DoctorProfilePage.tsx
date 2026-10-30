import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '../../types';
import { Stethoscope, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const doctor = user as Doctor;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Physician Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Hospital staff credentials and consultation settings.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs divide-y divide-gray-100 text-xs">
        <div className="pb-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xl shrink-0">
            {doctor?.full_name?.charAt(0) || 'D'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{doctor?.full_name}</h2>
            <p className="text-teal-700 font-semibold mt-0.5">{doctor?.specialization}</p>
            <div className="flex items-center gap-1 text-green-700 font-medium text-[11px] mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Hospital Practitioner</span>
            </div>
          </div>
        </div>

        <div className="py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number:
            </span>
            <span className="font-semibold text-slate-800">{doctor?.phone}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address:
            </span>
            <span className="font-semibold text-slate-800">{doctor?.email || 'N/A'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" /> Specialization:
            </span>
            <span className="font-semibold text-slate-800">{doctor?.specialization}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Standard Consultation Fee:
            </span>
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{Number(doctor?.consultation_fee).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-4 text-slate-500 text-[11px] leading-relaxed">
          * To update your medical department, consultation fee, or phone number, please contact hospital administration.
        </div>
      </div>
    </div>
  );
};

