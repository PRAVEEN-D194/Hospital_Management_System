export type UserRole = 'patient' | 'doctor' | 'admin';

export type Language = 'en' | 'ta';

export interface Patient {
  patient_id: number;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_language: 'en' | 'ta';
  is_active: boolean;
  created_at?: string;
}

export interface Doctor {
  doctor_id: number;
  full_name: string;
  specialization: string;
  phone: string;
  email: string | null;
  consultation_fee: number;
  is_active: boolean;
}

export interface Admin {
  admin_id: number;
  full_name: string;
  username: string;
  email: string;
  is_active: boolean;
}

export interface DoctorSchedule {
  schedule_id: number;
  doctor_id: number;
  day_of_week: number; // 0 = Monday, ..., 6 = Sunday
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_available: boolean;
  created_at?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit: string | null;
  appointment_status: AppointmentStatus;
  booking_source: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  notification_id: number;
  patient_id: number;
  appointment_id: number | null;
  notification_type: string;
  message: string;
  delivery_channel: string;
  delivery_status: 'pending' | 'sent' | 'failed';
  created_at: string;
  sent_at: string | null;
}

export interface VoiceCallLog {
  call_id: number;
  patient_id: number | null;
  appointment_id: number | null;
  phone_number: string;
  call_language: string;
  call_status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface VoiceCallTranscript {
  transcript_id: number;
  call_id: number;
  speaker: string;
  message: string;
  language: string;
  timestamp: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user: Patient | Doctor | Admin;
}
