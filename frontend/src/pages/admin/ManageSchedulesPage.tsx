import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { Doctor, DoctorSchedule } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Trash2, Calendar, Clock, ShieldAlert, CheckCircle2, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ManageSchedulesPage: React.FC = () => {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctor_id: 0,
    day_of_week: 0,
    start_time: '09:00',
    end_time: '13:00',
    slot_duration_minutes: 30,
    is_available: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await doctorService.getDoctors(false);
      setDoctors(docs);

      const docId = selectedDoctorFilter === 'all' ? undefined : selectedDoctorFilter;
      const scheds = await doctorService.getDoctorSchedules(docId, undefined, false);
      setSchedules(scheds);

      if (docs.length > 0 && formData.doctor_id === 0) {
        setFormData((prev) => ({ ...prev, doctor_id: docs[0].doctor_id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDoctorFilter]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor_id) {
      setError('Please select a doctor.');
      return;
    }
    if (formData.start_time >= formData.end_time) {
      setError('Start time must be before end time.');
      return;
    }

    try {
      setError(null);
      // Ensure time string has seconds if backend requires HH:MM:SS
      const formattedStart = formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time;
      const formattedEnd = formData.end_time.length === 5 ? `${formData.end_time}:00` : formData.end_time;

      await doctorService.createDoctorSchedule({
        doctor_id: Number(formData.doctor_id),
        day_of_week: Number(formData.day_of_week),
        start_time: formattedStart,
        end_time: formattedEnd,
        slot_duration_minutes: Number(formData.slot_duration_minutes),
        is_available: formData.is_available,
      });

      setSuccess('Consultation schedule added successfully.');
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create schedule.');
    }
  };

  const handleToggleScheduleActive = async (schedule: DoctorSchedule) => {
    try {
      setError(null);
      if (schedule.is_available) {
        await doctorService.deactivateDoctorSchedule(schedule.schedule_id);
        setSuccess('Schedule marked inactive.');
      } else {
        await doctorService.updateDoctorSchedule(schedule.schedule_id, { is_available: true });
        setSuccess('Schedule marked active.');
      }
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to toggle schedule state.');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule slot?')) return;
    try {
      setError(null);
      await doctorService.deleteDoctorSchedule(scheduleId);
      setSuccess('Schedule deleted successfully.');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete schedule.');
    }
  };

  const getDoctorName = (doctorId: number) => {
    const doc = doctors.find((d) => d.doctor_id === doctorId);
    return doc ? `Dr. ${doc.full_name} (${doc.specialization})` : `Doctor #${doctorId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('manageSchedules')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure weekly consultation hours and appointment slot durations for hospital doctors.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addSchedule')}
        </button>
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

      {/* Filter by Doctor */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {t('filterByDoctor')}:
          </label>
          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                Dr. {d.full_name} ({d.specialization})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Showing {schedules.length} recurring weekly consultation blocks
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('loading')}</div>
        ) : schedules.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No consultation schedules configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Day of Week</th>
                  <th className="px-6 py-3">Working Hours</th>
                  <th className="px-6 py-3">Slot Duration</th>
                  <th className="px-6 py-3">Availability</th>
                  <th className="px-6 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedules.map((sch) => (
                  <tr key={sch.schedule_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {getDoctorName(sch.doctor_id)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {DAYS[sch.day_of_week]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs text-gray-600">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {sch.slot_duration_minutes} mins
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sch.is_available ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {t('inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleToggleScheduleActive(sch)}
                        className={`text-xs font-medium px-2 py-1 border rounded ${
                          sch.is_available
                            ? 'text-amber-700 border-amber-300 hover:bg-amber-50'
                            : 'text-green-700 border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {sch.is_available ? t('deactivate') : t('reactivate')}
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(sch.schedule_id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Schedule */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">{t('addSchedule')}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Doctor *
                </label>
                <select
                  required
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value={0} disabled>Choose a Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      Dr. {d.full_name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day of the Week *
                </label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {DAYS.map((day, idx) => (
                    <option key={day} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
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
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Slot Duration (Minutes) *
                </label>
                <select
                  value={formData.slot_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, slot_duration_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sched_avail"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="sched_avail" className="text-xs text-gray-700 cursor-pointer">
                  Available for booking immediately
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

