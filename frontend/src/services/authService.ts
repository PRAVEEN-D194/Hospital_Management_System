import { apiClient } from './api';
import { TokenResponse, Patient, Doctor, Admin } from '../types';

export const authService = {
  async patientLogin(phone: string, password: string): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/patient/login', { phone, password });
    return res.data;
  },

  async doctorLogin(phone: string, password: string): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/doctor/login', { phone, password });
    return res.data;
  },

  async adminLogin(username: string, password: string): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/admin/login', { username, password });
    return res.data;
  },

  async patientRegister(data: {
    full_name: string;
    phone: string;
    email?: string | null;
    password: string;
    preferred_language: 'en' | 'ta';
  }): Promise<Patient> {
    const res = await apiClient.post<Patient>('/patients/', data);
    return res.data;
  },

  async getPatientProfile(): Promise<Patient> {
    const res = await apiClient.get<Patient>('/auth/patient/me');
    return res.data;
  },

  async getDoctorProfile(): Promise<Doctor> {
    const res = await apiClient.get<Doctor>('/auth/doctor/me');
    return res.data;
  },

  async getAdminProfile(): Promise<Admin> {
    const res = await apiClient.get<Admin>('/auth/admin/me');
    return res.data;
  },

  async updatePatientProfile(patientId: number, data: Partial<Patient>): Promise<Patient> {
    const res = await apiClient.put<Patient>(`/patients/${patientId}`, data);
    return res.data;
  },
};

