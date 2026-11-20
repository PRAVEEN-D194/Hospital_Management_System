import { apiClient } from './api';
import type { Doctor, DoctorSchedule } from '../types';

export const doctorService = {
  async getDefaultDoctor(): Promise<Doctor> {
    try {
      const res = await apiClient.get<Doctor>('/doctors/default');
      if (res.data && res.data.doctor_id) {
        return res.data;
      }
      throw new Error('Invalid doctor data received');
    } catch (primaryErr) {
      console.warn('Initial /doctors/default failed, attempting fallback to /doctors/?active_only=true', primaryErr);
      try {
        const fallbackRes = await apiClient.get<Doctor[]>('/doctors/', {
          params: { active_only: true },
        });
        if (fallbackRes.data && fallbackRes.data.length > 0) {
          return fallbackRes.data[0];
        }
      } catch (fallbackErr) {
        console.error('Fallback doctor query also failed', fallbackErr);
      }
      throw primaryErr;
    }
  },

  async getDoctors(activeOnly: boolean = true): Promise<Doctor[]> {
    const res = await apiClient.get<Doctor[]>('/doctors/', {
      params: { active_only: activeOnly },
    });
    return res.data;
  },

  async getDoctorById(doctorId: number): Promise<Doctor> {
    const res = await apiClient.get<Doctor>(`/doctors/${doctorId}`);
    return res.data;
  },

  async createDoctor(data: {
    full_name: string;
    specialization: string;
    phone: string;
    email?: string | null;
    password: string;
    consultation_fee: number;
  }): Promise<Doctor> {
    const res = await apiClient.post<Doctor>('/doctors/', data);
    return res.data;
  },

  async updateDoctor(doctorId: number, data: Partial<Doctor>): Promise<Doctor> {
    const res = await apiClient.put<Doctor>(`/doctors/${doctorId}`, data);
    return res.data;
  },

  async deactivateDoctor(doctorId: number): Promise<Doctor> {
    const res = await apiClient.patch<Doctor>(`/doctors/${doctorId}/deactivate`);
    return res.data;
  },

  async reactivateDoctor(doctorId: number): Promise<Doctor> {
    const res = await apiClient.patch<Doctor>(`/doctors/${doctorId}/reactivate`);
    return res.data;
  },

  async deleteDoctor(doctorId: number): Promise<void> {
    await apiClient.delete(`/doctors/${doctorId}`);
  },

  async getDoctorSchedules(doctorId?: number, dayOfWeek?: number, availableOnly: boolean = true): Promise<DoctorSchedule[]> {
    const res = await apiClient.get<DoctorSchedule[]>('/doctor-schedules/', {
      params: {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        available_only: availableOnly,
      },
    });
    return res.data;
  },

  async createDoctorSchedule(data: {
    doctor_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    is_available?: boolean;
  }): Promise<DoctorSchedule> {
    const res = await apiClient.post<DoctorSchedule>('/doctor-schedules/', data);
    return res.data;
  },

  async updateDoctorSchedule(scheduleId: number, data: Partial<DoctorSchedule>): Promise<DoctorSchedule> {
    const res = await apiClient.put<DoctorSchedule>(`/doctor-schedules/${scheduleId}`, data);
    return res.data;
  },

  async deactivateDoctorSchedule(scheduleId: number): Promise<DoctorSchedule> {
    const res = await apiClient.patch<DoctorSchedule>(`/doctor-schedules/${scheduleId}/deactivate`);
    return res.data;
  },

  async deleteDoctorSchedule(scheduleId: number): Promise<void> {
    await apiClient.delete(`/doctor-schedules/${scheduleId}`);
  },
};
