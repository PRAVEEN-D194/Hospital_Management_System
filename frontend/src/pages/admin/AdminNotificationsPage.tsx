import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, Send, CheckCircle2, Clock, AlertCircle, ShieldAlert, X, Plus } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientIdFilter, setPatientIdFilter] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    notification_type: 'reminder',
    message: '',
    delivery_channel: 'sms',
    delivery_status: 'pending',
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== 'all') params.delivery_status = statusFilter;
      if (patientIdFilter.trim()) params.patient_id = Number(patientIdFilter);

      const data = await notificationService.getAllNotifications(params);
      setNotifications(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter, patientIdFilter]);

  const handleUpdateStatus = async (notificationId: number, newStatus: 'pending' | 'sent' | 'failed') => {
    try {
      setError(null);
      await notificationService.updateNotificationStatus(notificationId, newStatus);
      setSuccess(`Notification #${notificationId} status updated to ${newStatus}.`);
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update notification status.');
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id) {
      setError('Please provide a valid Patient ID.');
      return;
    }
    try {
      setError(null);
      await notificationService.createNotification({
        patient_id: Number(formData.patient_id),
        appointment_id: formData.appointment_id ? Number(formData.appointment_id) : undefined,
        notification_type: formData.notification_type,
        message: formData.message,
        delivery_channel: formData.delivery_channel,
        delivery_status: formData.delivery_status,
      });

      setSuccess('Notification dispatched successfully.');
      setIsModalOpen(false);
      setFormData({
        patient_id: '',
        appointment_id: '',
        notification_type: 'reminder',
        message: '',
        delivery_channel: 'sms',
        delivery_status: 'pending',
      });
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to dispatch notification.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('notifications')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dispatch, track, and monitor SMS and alert notifications delivered to patients.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          Send Patient Notification
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <input
              type="number"
              placeholder="Filter by Patient ID..."
              value={patientIdFilter}
              onChange={(e) => setPatientIdFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Showing {notifications.length} notification log records
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('loading')}</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No notifications found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Patient ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Channel</th>
                  <th className="px-6 py-3">Message</th>
                  <th className="px-6 py-3">{t('status')}</th>
                  <th className="px-6 py-3">Created / Sent</th>
                  <th className="px-6 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <tr key={n.notification_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                      #{n.notification_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      Patient #{n.patient_id}
                      {n.appointment_id && (
                        <span className="block text-xs text-gray-400">Appt #{n.appointment_id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                        {n.notification_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 uppercase text-xs font-semibold whitespace-nowrap">
                      {n.delivery_channel}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-sm truncate">
                      {n.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        n.delivery_status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : n.delivery_status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {n.delivery_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      <div>{new Date(n.created_at).toLocaleDateString()}</div>
                      <div className="text-[11px] text-gray-400">
                        {n.sent_at ? `Sent: ${new Date(n.sent_at).toLocaleTimeString()}` : 'Not dispatched yet'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                      {n.delivery_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(n.notification_id, 'sent')}
                            className="text-xs font-medium px-2 py-1 border border-green-200 text-green-700 rounded hover:bg-green-50"
                          >
                            Mark Sent
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(n.notification_id, 'failed')}
                            className="text-xs font-medium px-2 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50"
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                      {n.delivery_status !== 'pending' && (
                        <span className="text-xs text-gray-400 italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Dispatch Notification */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Send Patient Notification</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Patient ID *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Appointment ID (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.appointment_id}
                    onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notification Type
                  </label>
                  <select
                    value={formData.notification_type}
                    onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="reminder">Reminder</option>
                    <option value="confirmation">Confirmation</option>
                    <option value="cancellation">Cancellation</option>
                    <option value="reschedule">Reschedule</option>
                    <option value="general">General Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Channel
                  </label>
                  <select
                    value={formData.delivery_channel}
                    onChange={(e) => setFormData({ ...formData, delivery_channel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type message to patient..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

