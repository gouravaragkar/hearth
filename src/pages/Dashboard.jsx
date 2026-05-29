import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/PullToRefresh';
import { getMonthlyEquivalent, getNextDueDate, CATEGORY_COLORS } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencies';
import { useHome } from '@/context/HomeContext';
import UpcomingPayments from '@/components/UpcomingPayments';
import MonthlySummary from '@/components/MonthlySummary';
import MonthlyReportCard from '@/components/MonthlyReportCard';
import AllExpensesCard from '@/components/AllExpensesCard';
import InsightsCard from '@/components/InsightsCard';
import { startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { FileBarChart, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
  const [reportOpen, setReportOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [allExpensesOpen, setAllExpensesOpen] = useState(false);
  const qc = useQueryClient();
  const user = useCurrentUser();
  const { activeHome } = useHome();
  const currency = activeHome?.currency || 'AUD';
  const handleRefresh = () => Promise.all([
    qc.invalidateQueries({ queryKey: ['expenses'] }),
    qc.invalidateQueries({ queryKey: ['recurring'] }),
    qc.invalidateQueries({ queryKey: ['budget'] }),
  ]);

  const { data: allExpenses = [] } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: () => base44.entities.Expense.filter({ created_by_id: user.id }, '-date', 200),
    enabled: !!user?.id,
  });

  const { data: allRecurring = [] } = useQuery({
    queryKey: ['recurring', user?.id],
    queryFn: () => base44.entities.RecurringExpense.filter({ created_by_id: user.id }, '-created_date', 200),
    enabled: !!user?.id,
  });

  const expenses = allExpenses.filter(e => e.home_id === activeHome?.id);
  const recurring = allRecurring.filter(e => e.home_id === activeHome?.id);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data: budgets = [] } = useQuery({
    queryKey: ['budget', user?.id],
    queryFn: () => base44.entities.Budget.filter({ month: currentMonth, created_by_id: user.id }),
    enabled: !!user?.id,
  });
  const budget = budgets[0] || null;

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
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-6 animate-fade-up px-4 py-6 pb-28">
      <div className="flex items-start justify-between">
        <div />
        <div className="flex gap-2 mt-1">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setAllExpensesOpen(true)}>
            <FileBarChart size={14} /> Expenses
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setInsightsOpen(true)}>
            <BarChart2 size={14} /> Insights
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setReportOpen(true)}>
            <FileBarChart size={14} /> Report
          </Button>
        </div>
      </div>

      {/* Upcoming Payments — topmost */}
      <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-5">
        <h2 className="font-semibold text-foreground mb-3">Due in the Next 7 Days</h2>
        <UpcomingPayments recurringExpenses={enrichedRecurring} />
      </div>

      {/* Monthly Summary */}
      <MonthlySummary totalSpent={totalMonthly} budget={budget} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Monthly Estimate"
          value={formatCurrency(totalMonthly, currency)}
          sub="One-time + recurring"
          emoji="💰"
          color="hsl(16 76% 60%)"
        />
        <StatCard
          label="Recurring/mo"
          value={formatCurrency(recurringMonthly, currency)}
          sub={`${enrichedRecurring.length} active`}
          emoji="🔄"
          color="hsl(130 20% 45%)"
        />
        <StatCard
          label="This Month Spent"
          value={formatCurrency(oneTimeTotal, currency)}
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

      <AllExpensesCard
        open={allExpensesOpen}
        onClose={() => setAllExpensesOpen(false)}
        expenses={expenses}
        recurring={enrichedRecurring}
      />

      <InsightsCard
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        expenses={expenses}
        recurring={enrichedRecurring}
        donutData={donutData}
        totalMonthly={totalMonthly}
        topCategory={topCategory}
      />

      <MonthlyReportCard
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        expenses={expenses}
        recurring={enrichedRecurring}
        budget={budget}
      />
    </div>
    </PullToRefresh>
  );
}