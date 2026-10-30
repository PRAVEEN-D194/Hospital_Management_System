import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { getErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Notification } from '../../types';
import { Bell, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getMyNotifications();
        setNotifications(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">{t('notifications')}</h1>
        <p className="text-xs text-slate-500 mt-1">Direct alerts regarding your appointments and hospital updates.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 border border-dashed border-gray-200 rounded-lg text-center bg-white text-xs text-slate-500">
          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No notifications yet</p>
          <p className="text-slate-400 mt-0.5">Booking updates will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.notification_id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 capitalize">
                    {n.notification_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{n.message}</p>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Channel: {n.delivery_channel}</span>
                  <span>•</span>
                  <span className="capitalize">Status: {n.delivery_status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

