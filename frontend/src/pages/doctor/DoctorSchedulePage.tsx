import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { Doctor, DoctorSchedule } from '../../types';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const DoctorSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const doctor = user as Doctor;

  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!doctor?.doctor_id) return;
      try {
        setLoading(true);
        const data = await doctorService.getDoctorSchedules(doctor.doctor_id, undefined, false);
        setSchedules(data);
      } catch (err) {
        console.error('Failed to load doctor schedules', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [doctor?.doctor_id]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">My Consultation Schedule</h1>
        <p className="text-xs text-slate-500 mt-1">
          Working hours and consultation intervals managed by hospital administration.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading schedule...</div>
      ) : schedules.length === 0 ? (
        <div className="p-12 border border-dashed border-gray-200 rounded-lg text-center bg-white text-xs text-slate-500">
          No regular schedule currently active. Contact hospital administrator to set up consultation blocks.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((s) => (
            <div key={s.schedule_id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900">
                  {daysOfWeek[s.day_of_week] || `Day ${s.day_of_week}`}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                    s.is_available
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {s.is_available ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Slot Duration: {s.slot_duration_minutes} Minutes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

