import { apiClient } from './api';
import type { Appointment, AppointmentStatus } from '../types';

export const appointmentService = {
  async bookAppointment(data: {
    doctor_id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    reason_for_visit?: string | null;
    booking_source?: 'web' | 'voice';
  }): Promise<Appointment> {
    const res = await apiClient.post<Appointment>('/appointments/', data);
    return res.data;
  },

  async getMyAppointments(): Promise<Appointment[]> {
    const res = await apiClient.get<Appointment[]>('/appointments/my');
    return res.data;
  },

  async getPatientAppointments(patientId: number): Promise<Appointment[]> {
    const res = await apiClient.get<Appointment[]>(`/appointments/patient/${patientId}`);
    return res.data;
  },

  async getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
    const res = await apiClient.get<Appointment[]>(`/appointments/doctor/${doctorId}`);
    return res.data;
  },

  async getAllAppointments(params?: {
    status?: string;
    doctor_id?: number;
    appointment_date?: string;
  }): Promise<Appointment[]> {
    const res = await apiClient.get<Appointment[]>('/appointments/', { params });
    return res.data;
  },

  async getAppointmentById(appointmentId: number): Promise<Appointment> {
    const res = await apiClient.get<Appointment>(`/appointments/${appointmentId}`);
    return res.data;
  },

  async cancelAppointment(appointmentId: number): Promise<Appointment> {
    const res = await apiClient.patch<Appointment>(`/appointments/${appointmentId}/cancel`);
    return res.data;
  },

  async rescheduleAppointment(appointmentId: number, data: {
    appointment_date: string;
    start_time: string;
    end_time: string;
  }): Promise<Appointment> {
    const res = await apiClient.patch<Appointment>(`/appointments/${appointmentId}/reschedule`, data);
    return res.data;
  },

  async updateAppointmentStatus(appointmentId: number, status: AppointmentStatus): Promise<Appointment> {
    const res = await apiClient.patch<Appointment>(`/appointments/${appointmentId}/status`, {
      appointment_status: status,
    });
    return res.data;
  },
};
