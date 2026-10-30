import React, { useState, useEffect } from 'react';
import { voiceCallService } from '../../services/voiceCallService';
import { VoiceCallLog, VoiceCallTranscript } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { PhoneCall, Clock, ShieldAlert, X, FileText } from 'lucide-react';

export const VoiceCallLogsPage: React.FC = () => {
  const { t } = useLanguage();
  const [calls, setCalls] = useState<VoiceCallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transcript Modal State
  const [selectedCall, setSelectedCall] = useState<VoiceCallLog | null>(null);
  const [transcripts, setTranscripts] = useState<VoiceCallTranscript[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voiceCallService.getVoiceCalls();
      setCalls(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch voice call logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const handleOpenTranscripts = async (call: VoiceCallLog) => {
    setSelectedCall(call);
    try {
      setLoadingTranscripts(true);
      setTranscriptError(null);
      const data = await voiceCallService.getVoiceCallTranscripts(call.call_id);
      setTranscripts(data);
    } catch (err: any) {
      setTranscriptError(err.response?.data?.detail || 'Failed to fetch transcript messages.');
    } finally {
      setLoadingTranscripts(false);
    }
  };

  const getCallDuration = (call: VoiceCallLog) => {
    if (call.started_at && call.ended_at) {
      const diffSecs = Math.max(0, Math.floor((new Date(call.ended_at).getTime() - new Date(call.started_at).getTime()) / 1000));
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('voiceCallLogs')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review automated voice booking agent calls, patient phone interactions, and transcript audits.
        </p>
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

      {/* Calls Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('loading')}</div>
        ) : calls.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No voice call logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Call ID</th>
                  <th className="px-6 py-3">Phone Number</th>
                  <th className="px-6 py-3">Patient ID</th>
                  <th className="px-6 py-3">Language</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">{t('status')}</th>
                  <th className="px-6 py-3">Call Time</th>
                  <th className="px-6 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {calls.map((call) => (
                  <tr key={call.call_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                      #{call.call_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center">
                        <PhoneCall className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                        {call.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {call.patient_id ? `#${call.patient_id}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {call.call_language}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {getCallDuration(call)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase ${
                        call.call_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : call.call_status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {call.call_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(call.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenTranscripts(call)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        {t('viewTranscripts')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 border border-gray-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Call Transcript: #{selectedCall.call_id}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Caller: {selectedCall.phone_number} | Language: {selectedCall.call_language.toUpperCase()} | Status: {selectedCall.call_status}
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {loadingTranscripts ? (
                <div className="text-center py-8 text-sm text-gray-500">{t('loading')}</div>
              ) : transcriptError ? (
                <div className="text-center py-8 text-sm text-red-500">{transcriptError}</div>
              ) : transcripts.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No dialog transcripts recorded for this call.
                </div>
              ) : (
                transcripts.map((item) => {
                  const isUser = item.speaker.toLowerCase() === 'user' || item.speaker.toLowerCase() === 'patient';
                  return (
                    <div
                      key={item.transcript_id}
                      className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-[11px] font-medium text-gray-500 mb-0.5 px-1">
                        {isUser ? `Patient (${item.speaker})` : `Hospital Voice AI (${item.speaker})`}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-lg px-3.5 py-2 text-sm ${
                          isUser
                            ? 'bg-gray-100 text-gray-900 border border-gray-200'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {item.message}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 px-1">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
