import React from 'react';
import { Bell, X, CheckCheck, AlertCircle, Calendar, HeartPulse, Scale, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearNotifications } = useData();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'weight_alert': return <Scale className="w-4 h-4 text-amber-400" />;
      case 'injury_update': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'upcoming_test': return <Calendar className="w-4 h-4 text-blue-400" />;
      default: return <AlertCircle className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 lg:p-6 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden mt-12 animate-in slide-in-from-top-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">Coach Alerts & Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearNotifications}
              className="text-[11px] text-slate-400 hover:text-white transition px-2 py-0.5 rounded hover:bg-slate-800"
            >
              Clear All
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2 text-xs">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No active alerts. All athlete metrics within target parameters.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border transition ${
                  notif.isRead 
                    ? 'bg-slate-800/30 border-slate-800 text-slate-400' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {getIcon(notif.type)}
                    <span className="font-semibold text-white text-xs">{notif.title}</span>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="p-1 text-slate-400 hover:text-amber-400"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 pl-6 rtl:pl-0 rtl:pr-6 leading-relaxed">
                  {notif.message}
                </p>
                <p className="text-[9px] text-slate-400 pl-6 rtl:pl-0 rtl:pr-6 mt-1 font-mono">
                  {new Date(notif.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
