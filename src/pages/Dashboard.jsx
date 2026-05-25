import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatAUD, getMonthlyEquivalent, getNextDueDate, CATEGORY_COLORS } from '@/lib/utils';
import SpendingDonut from '@/components/SpendingDonut';
import UpcomingPayments from '@/components/UpcomingPayments';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

function StatCard({ label, value, sub, emoji, color }) {
  return (
    <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-4 flex items-start gap-3">
      <div className="text-2xl">{emoji}</div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-bold mt-0.5" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 100),
  });

  const { data: recurring = [] } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => base44.entities.RecurringExpense.list('-created_date', 100),
  });

  // Enrich recurring with computed next_due_date
  const enrichedRecurring = recurring.map(e => ({
    ...e,
    next_due_date: e.next_due_date || getNextDueDate(e.start_date, e.frequency).toISOString().split('T')[0],
  }));

  // This month one-time
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const oneTimeTotal = thisMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const recurringMonthly = enrichedRecurring.reduce((s, e) => s + getMonthlyEquivalent(e.amount, e.frequency), 0);
  const totalMonthly = oneTimeTotal + recurringMonthly;

  // Category breakdown (combine both)
  const categoryMap = {};
  thisMonthExpenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  enrichedRecurring.forEach(e => {
    const monthly = getMonthlyEquivalent(e.amount, e.frequency);
    categoryMap[e.category] = (categoryMap[e.category] || 0) + monthly;
  });

  const donutData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topCategory = donutData[0];
  const unpaidRecurring = enrichedRecurring.filter(e => !e.paid_this_cycle).length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good day! 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your household spending overview</p>
      </div>

      {/* Upcoming Payments — topmost */}
      <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-5">
        <h2 className="font-semibold text-foreground mb-3">Due in the Next 7 Days</h2>
        <UpcomingPayments recurringExpenses={enrichedRecurring} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Monthly Estimate"
          value={formatAUD(totalMonthly)}
          sub="One-time + recurring"
          emoji="💰"
          color="hsl(16 76% 60%)"
        />
        <StatCard
          label="Recurring/mo"
          value={formatAUD(recurringMonthly)}
          sub={`${enrichedRecurring.length} active`}
          emoji="🔄"
          color="hsl(130 20% 45%)"
        />
        <StatCard
          label="This Month Spent"
          value={formatAUD(oneTimeTotal)}
          sub={`${thisMonthExpenses.length} transactions`}
          emoji="🛒"
          color="hsl(42 58% 45%)"
        />
        <StatCard
          label="Bills Unpaid"
          value={`${unpaidRecurring}`}
          sub="recurring this cycle"
          emoji="📋"
          color={unpaidRecurring > 0 ? 'hsl(0 72% 55%)' : 'hsl(130 20% 45%)'}
        />
      </div>

      {/* Donut Chart */}
      <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">Spending Breakdown</h2>
          {topCategory && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-1">
              Top: {topCategory.name}
            </span>
          )}
        </div>
        <SpendingDonut data={donutData} totalMonthly={totalMonthly} />
      </div>
    </div>
  );
}