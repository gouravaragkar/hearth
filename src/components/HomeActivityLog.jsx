import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Plus, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACTION_ICON = {
  create: <Plus size={12} className="text-green-600" />,
  update: <Pencil size={12} className="text-amber-500" />,
  delete: <Trash2 size={12} className="text-destructive" />,
};

const ACTION_COLOR = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
};

const ENTITY_LABEL = {
  Home: '🏠 Home',
  Expense: '🧾 Expense',
  RecurringExpense: '🔄 Recurring',
  Budget: '💰 Budget',
};

export default function HomeActivityLog({ home, open, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !home?.id) return;
    setLoading(true);
    setLogs([]);
    supabase
      .from('home_activities')
      .select('*')
      .eq('home_id', home.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error) setLogs(data || []);
      })
      .finally(() => setLoading(false));
  }, [open, home?.id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md mx-auto max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={18} className="text-primary" />
            Activity — {home?.emoji} {home?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {loading && (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}
            </div>
          )}
          {!loading && logs.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <History size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No activity recorded yet</p>
            </div>
          )}
          {!loading && logs.map(log => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="mt-0.5 shrink-0">{ACTION_ICON[log.action]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${ACTION_COLOR[log.action]}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-muted-foreground">{ENTITY_LABEL[log.entity] || log.entity}</span>
                  {log.record_name && (
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{log.record_name}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground font-medium">{log.actor_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
                {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
