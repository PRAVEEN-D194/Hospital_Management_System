import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { patientAdminService } from '../../services/patientAdminService';
import { appointmentService } from '../../services/appointmentService';
import { voiceCallService } from '../../services/voiceCallService';
import { Stethoscope, Users, Calendar, PhoneCall, Clock, Bell, ArrowRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    doctorsCount: 0,
    patientsCount: 0,
    appointmentsCount: 0,
    callsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [docs, patients, appts, calls] = await Promise.all([
          doctorService.getDoctors(false),
          patientAdminService.getAllPatients(),
          appointmentService.getAllAppointments(),
          voiceCallService.getVoiceCalls(),
        ]);

        setStats({
          doctorsCount: docs.length,
          patientsCount: patients.length,
          appointmentsCount: appts.length,
          callsCount: calls.length,
        });
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900">Hospital Administration Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational overview for St. Mary Multispeciality Hospital
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Medical Doctors</span>
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.doctorsCount}</p>
          <Link to="/admin/doctors" className="text-[11px] font-semibold text-blue-600 hover:underline mt-1 block">
            Manage Doctors →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Registered Patients</span>
            <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.patientsCount}</p>
          <Link to="/admin/patients" className="text-[11px] font-semibold text-teal-600 hover:underline mt-1 block">
            View Patients →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Consultations</span>
            <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.appointmentsCount}</p>
          <Link to="/admin/appointments" className="text-[11px] font-semibold text-purple-600 hover:underline mt-1 block">
            View Appointments →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Voice Call Logs</span>
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.callsCount}</p>
          <Link to="/admin/calls" className="text-[11px] font-semibold text-amber-600 hover:underline mt-1 block">
            View Transcripts →
          </Link>
        </div>
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Physicians & Consultations</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Register new hospital specialists, define their consultation fees, and publish working day consultation hours.
          </p>
          <div className="flex gap-2 pt-2">
            <Link
              to="/admin/doctors"
              className="px-3.5 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 shadow-xs"
            >
              Add or Edit Doctor
            </Link>
            <Link
              to="/admin/schedules"
              className="px-3.5 py-2 border border-gray-300 text-slate-700 rounded text-xs font-medium hover:bg-gray-50"
            >
              Doctor Schedules
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Hospital Appointment Registry</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Monitor real-time patient reservations, manage booking conflicts, and audit incoming telephony logs.
          </p>
          <div className="flex gap-2 pt-2">
            <Link
              to="/admin/appointments"
              className="px-3.5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 shadow-xs"
            >
              All Appointments
            </Link>
            <Link
              to="/admin/calls"
              className="px-3.5 py-2 border border-gray-300 text-slate-700 rounded text-xs font-medium hover:bg-gray-50"
            >
              Call Transcripts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

