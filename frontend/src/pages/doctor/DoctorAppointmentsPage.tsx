import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { getErrorMessage } from '../../services/api';
import { Appointment, Doctor, AppointmentStatus } from '../../types';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const DoctorAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const doctor = user as Doctor;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    if (!doctor?.doctor_id) return;
    try {
      setLoading(true);
      const data = await appointmentService.getDoctorAppointments(doctor.doctor_id);
      setAppointments(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctor?.doctor_id]);

  const handleUpdateStatus = async (appointmentId: number, status: AppointmentStatus) => {
    try {
      setStatusUpdatingId(appointmentId);
      await appointmentService.updateAppointmentStatus(appointmentId, status);
      await fetchAppointments();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Doctor Consultation Log</h1>
        <p className="text-xs text-slate-500 mt-1">Review assigned patient appointments and update consultation outcomes.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading consultations...</div>
      ) : appointments.length === 0 ? (
        <div className="p-12 border border-dashed border-gray-200 rounded-lg text-center bg-white text-xs text-slate-500">
          No appointments recorded under your profile.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt) => (
                  <tr key={appt.appointment_id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">#{appt.appointment_id}</td>
                    <td className="py-3 px-4 font-medium">Patient ID #{appt.patient_id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>{appt.appointment_date}</div>
                      <div className="text-slate-400 text-[11px]">{appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {appt.reason_for_visit || <span className="text-gray-300 italic">None provided</span>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          appt.appointment_status === 'confirmed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : appt.appointment_status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : appt.appointment_status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}
                      >
                        {appt.appointment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {appt.appointment_status === 'confirmed' && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            disabled={statusUpdatingId === appt.appointment_id}
                            onClick={() => handleUpdateStatus(appt.appointment_id, 'completed')}
                            className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded text-[11px] font-medium"
                          >
                            Mark Completed
                          </button>
                          <button
                            disabled={statusUpdatingId === appt.appointment_id}
                            onClick={() => handleUpdateStatus(appt.appointment_id, 'cancelled')}
                            className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-[11px] font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

