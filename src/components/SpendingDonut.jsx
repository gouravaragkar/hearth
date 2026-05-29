import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_COLORS } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencies';

const makeTooltip = (currency) => ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl shadow-warm-md px-3 py-2 text-sm">
      <p className="font-semibold text-foreground">{name}</p>
      <p className="text-primary">{formatCurrency(value, currency)}</p>
      <p className="text-muted-foreground">{(percent * 100).toFixed(1)}% of total</p>
    </div>
  );
};

const CustomLabel = ({ cx, cy, totalMonthly, currency }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
    <tspan x={cx} dy="-0.4em" className="fill-foreground" style={{ fontSize: 14, fontWeight: 500, fill: 'hsl(30 40% 14%)' }}>
      Monthly
    </tspan>
    <tspan x={cx} dy="1.4em" style={{ fontSize: 18, fontWeight: 700, fill: 'hsl(16 76% 60%)' }}>
      {formatCurrency(totalMonthly, currency)}
    </tspan>
  </text>
);

export default function SpendingDonut({ data, totalMonthly, currency = 'AUD' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-muted-foreground text-sm">
        <span className="text-3xl mb-2">🥧</span>
        <p>No spending data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
          label={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ADB5BD'} strokeWidth={0} />
          ))}
          <CustomLabel cx="50%" cy="45%" totalMonthly={totalMonthly} currency={currency} />
        </Pie>
        <Tooltip content={makeTooltip(currency)} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 12, color: 'hsl(30 20% 50%)' }}>{value}</span>}
          wrapperStyle={{ paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}