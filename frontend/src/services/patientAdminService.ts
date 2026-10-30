import { apiClient } from './api';
import { Patient } from '../types';

export const patientAdminService = {
  async getAllPatients(): Promise<Patient[]> {
    const res = await apiClient.get<Patient[]>('/patients/');
    return res.data;
  },

  async deactivatePatient(patientId: number): Promise<Patient> {
    const res = await apiClient.patch<Patient>(`/patients/${patientId}/deactivate`);
    return res.data;
  },

  async deletePatient(patientId: number): Promise<void> {
    await apiClient.delete(`/patients/${patientId}`);
  },
};

