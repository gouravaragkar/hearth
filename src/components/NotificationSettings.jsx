import { useState } from 'react';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const DAYS_OPTIONS = [
  { value: 1, label: 'Day before' },
  { value: 2, label: '2 days before' },
  { value: 3, label: '3 days before' },
  { value: 5, label: '5 days before' },
  { value: 7, label: 'Week before' },
];

export default function NotificationSettings() {
  const { isSupported, isSubscribed, daysBefore, loading, isIOS, isPWA, subscribe, unsubscribe, updateDaysBefore } = usePushNotifications();
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe(daysBefore);
    }
    setToggling(false);
  };

  const handleDaysChange = async (days) => {
    if (isSubscribed) {
      await updateDaysBefore(days);
    } else {
      await subscribe(days);
    }
  };

  if (loading) return null;

  // iPhone not in PWA mode
  if (isIOS && !isPWA) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs font-medium text-amber-800">Install app for notifications</p>
        </div>
        <p className="text-xs text-amber-700">
          On iPhone, tap Share → "Add to Home Screen" to enable bill reminders.
        </p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <p className="text-xs text-muted-foreground">Push notifications not supported on this device.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSubscribed
            ? <Bell size={14} className="text-primary" />
            : <BellOff size={14} className="text-muted-foreground" />}
          <div>
            <p className="text-sm font-medium text-foreground">Bill reminders</p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed
                ? `Notified ${DAYS_OPTIONS.find(d => d.value === daysBefore)?.label?.toLowerCase()} bills are due`
                : 'Get notified before bills are due'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isSubscribed ? 'bg-primary' : 'bg-muted border border-border'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isSubscribed ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {isSubscribed && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Remind me:</p>
          <div className="flex flex-wrap gap-2">
            {DAYS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleDaysChange(value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  daysBefore === value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
