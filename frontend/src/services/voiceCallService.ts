import { apiClient } from './api';
import { VoiceCallLog, VoiceCallTranscript } from '../types';

export const voiceCallService = {
  async getVoiceCalls(): Promise<VoiceCallLog[]> {
    const res = await apiClient.get<VoiceCallLog[]>('/voice-calls/');
    return res.data;
  },

  async getVoiceCallTranscripts(callId: number): Promise<VoiceCallTranscript[]> {
    const res = await apiClient.get<VoiceCallTranscript[]>(`/voice-calls/${callId}/transcripts`);
    return res.data;
  },
};

