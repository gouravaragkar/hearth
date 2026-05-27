import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { formatAUD, getMonthlyEquivalent } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload[0]?.value + payload[1]?.value;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-warm-md text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">One-time: <span className="text-foreground font-medium">{formatAUD(payload[0]?.value || 0)}</span></p>
      <p className="text-muted-foreground">Recurring: <span className="text-foreground font-medium">{formatAUD(payload[1]?.value || 0)}</span></p>
      <p className="text-primary font-semibold mt-1">Total: {formatAUD(total)}</p>
    </div>
  );
};

export default function SpendingTrend({ expenses, recurring }) {
  const data = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const oneTime = expenses
        .filter(e => isWithinInterval(new Date(e.date), { start, end }))
        .reduce((s, e) => s + (e.amount || 0), 0);

      const rec = recurring.reduce((s, e) => s + getMonthlyEquivalent(e.amount, e.frequency), 0);

      return {
        month: format(monthDate, 'MMM'),
        oneTime: Math.round(oneTime),
        recurring: Math.round(rec),
        total: Math.round(oneTime + rec),
      };
    });
  }, [expenses, recurring]);

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const trend = data[5].total - data[0].total;
  const trendLabel = trend < 0
    ? `↓ ${formatAUD(Math.abs(trend))} less than 6 months ago`
    : trend > 0
    ? `↑ ${formatAUD(trend)} more than 6 months ago`
    : 'Stable over 6 months';
  const trendColor = trend < 0 ? 'text-green-500' : trend > 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground">6-Month Trend</h2>
        <span className={`text-xs font-medium ${trendColor}`}>{trendLabel}</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradOneTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(42 58% 58%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(42 58% 58%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRecurring" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(16 76% 60%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(16 76% 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="oneTime" stackId="1" stroke="hsl(42 58% 58%)" strokeWidth={2} fill="url(#gradOneTime)" name="One-time" />
          <Area type="monotone" dataKey="recurring" stackId="1" stroke="hsl(16 76% 60%)" strokeWidth={2} fill="url(#gradRecurring)" name="Recurring" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-0.5 rounded-full bg-gold inline-block" />
          One-time
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-0.5 rounded-full bg-primary inline-block" />
          Recurring
        </div>
      </div>
    </div>
  );
}