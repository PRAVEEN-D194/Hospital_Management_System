import { apiClient } from './api';
import { Notification } from '../types';

export const notificationService = {
  async getAllNotifications(params?: { patient_id?: number; delivery_status?: string }): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>('/notifications/', { params });
    return res.data;
  },

  async createNotification(data: {
    patient_id: number;
    appointment_id?: number | null;
    notification_type: string;
    message: string;
    delivery_channel?: string;
    delivery_status?: string;
  }): Promise<Notification> {
    const res = await apiClient.post<Notification>('/notifications/', data);
    return res.data;
  },

  async getMyNotifications(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>('/notifications/my');
    return res.data;
  },

  async getPatientNotifications(patientId: number): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>(`/notifications/patient/${patientId}`);
    return res.data;
  },

  async updateNotificationStatus(notificationId: number, status: 'pending' | 'sent' | 'failed'): Promise<Notification> {
    const res = await apiClient.patch<Notification>(`/notifications/${notificationId}/status`, {
      delivery_status: status,
    });
    return res.data;
  },
};
