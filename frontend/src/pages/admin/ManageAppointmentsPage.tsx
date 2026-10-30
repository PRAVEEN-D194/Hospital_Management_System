import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { Appointment, AppointmentStatus, Doctor } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar, Clock, Filter, ShieldAlert, CheckCircle2, X, AlertTriangle } from 'lucide-react';

export const ManageAppointmentsPage: React.FC = () => {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Reschedule Modal State
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  const loadDoctorsAndAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await doctorService.getDoctors(false);
      setDoctors(docs);

      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (doctorFilter !== 'all') params.doctor_id = Number(doctorFilter);
      if (dateFilter) params.appointment_date = dateFilter;

      const appts = await appointmentService.getAllAppointments(params);
      setAppointments(appts);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorsAndAppointments();
  }, [statusFilter, doctorFilter, dateFilter]);

  const handleStatusChange = async (appointmentId: number, newStatus: AppointmentStatus) => {
    try {
      setError(null);
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      setSuccess(`Appointment #${appointmentId} status changed to ${newStatus}.`);
      loadDoctorsAndAppointments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status.');
    }
  };

  const handleOpenReschedule = (appt: Appointment) => {
    setSelectedAppt(appt);
    setRescheduleData({
      date: appt.appointment_date,
      startTime: appt.start_time.slice(0, 5),
      endTime: appt.end_time.slice(0, 5),
    });
    setIsRescheduleOpen(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      setError(null);
      const startFormatted = rescheduleData.startTime.length === 5 ? `${rescheduleData.startTime}:00` : rescheduleData.startTime;
      const endFormatted = rescheduleData.endTime.length === 5 ? `${rescheduleData.endTime}:00` : rescheduleData.endTime;

      await appointmentService.rescheduleAppointment(selectedAppt.appointment_id, {
        appointment_date: rescheduleData.date,
        start_time: startFormatted,
        end_time: endFormatted,
      });

      setSuccess(`Appointment #${selectedAppt.appointment_id} rescheduled.`);
      setIsRescheduleOpen(false);
      loadDoctorsAndAppointments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reschedule appointment.');
    }
  };

  const getDoctorName = (doctorId: number) => {
    const doc = doctors.find((d) => d.doctor_id === doctorId);
    return doc ? `Dr. ${doc.full_name}` : `Doctor #${doctorId}`;
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{t('confirmed')}</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{t('pending')}</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{t('completed')}</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{t('cancelled')}</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('manageAppointments')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor all hospital consultations, patient visits, and live booking source channels.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between">
          <div className="flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t('filterByStatus')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t('filterByDoctor')}
          </label>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                Dr. {d.full_name} ({d.specialization})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Filter by Date
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-500 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('loading')}</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No appointments match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Patient ID</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Date & Slot</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">{t('status')}</th>
                  <th className="px-6 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt) => (
                  <tr key={appt.appointment_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                      #{appt.appointment_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      Patient #{appt.patient_id}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {getDoctorName(appt.doctor_id)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      <div>
                        <span className="font-medium text-gray-900">{appt.appointment_date}</span>
                        <div className="text-xs text-gray-500 flex items-center mt-0.5">
                          <Clock className="h-3 w-3 mr-1" />
                          {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {appt.reason_for_visit || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                        appt.booking_source === 'voice' ? 'bg-purple-100 text-purple-800' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {appt.booking_source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appt.appointment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                      {appt.appointment_status !== 'completed' && appt.appointment_status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appt.appointment_id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(appt.appointment_id, 'completed')}
                            className="text-emerald-700 hover:text-emerald-800 text-xs font-medium px-2 py-1 border border-emerald-300 rounded hover:bg-emerald-50"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleOpenReschedule(appt)}
                            className="text-gray-700 hover:text-gray-900 text-xs font-medium px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleStatusChange(appt.appointment_id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(appt.appointment_status === 'completed' || appt.appointment_status === 'cancelled') && (
                        <span className="text-xs text-gray-400 italic">No further actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {isRescheduleOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Reschedule Appointment #{selectedAppt.appointment_id}</h3>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.startTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.endTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
