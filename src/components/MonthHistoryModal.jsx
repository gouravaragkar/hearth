import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currencies';
import { CATEGORY_COLORS, CATEGORY_ICONS, getMonthlyEquivalent } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, PieChart, List, FileBarChart } from 'lucide-react';
import SpendingDonut from '@/components/SpendingDonut';
import { jsPDF } from 'jspdf';

// Generate last 12 months (most recent first)
function buildMonthOptions() {
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = subMonths(new Date(), i);
    options.push({
      label: format(d, 'MMMM yyyy'),
      value: format(d, 'yyyy-MM'),
      date: d,
    });
  }
  return options;
}

const MONTHS = buildMonthOptions();
const TABS = [
  { id: 'expenses', label: 'Expenses', Icon: List },
  { id: 'insights', label: 'Insights', Icon: PieChart },
  { id: 'report', label: 'Report', Icon: FileBarChart },
];

export default function MonthHistoryModal({ open, onClose, expenses, recurring, budgets, currency }) {
  const [monthIdx, setMonthIdx] = useState(0);
  const [tab, setTab] = useState('expenses');

  const selected = MONTHS[monthIdx];
  const monthStart = startOfMonth(selected.date);
  const monthEnd = endOfMonth(selected.date);

  const budget = budgets?.find(b => b.month === selected.value) || null;
  const budgetAmount = budget?.amount || 0;

  const { monthExpenses, oneTimeTotal, recurringTotal, totalSpent, categoryMap, donutData } = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      if (!e.date) return false;
      return isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd });
    });

    const catMap = {};
    monthExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + (e.amount || 0);
    });
    recurring.forEach(e => {
      const m = getMonthlyEquivalent(e.amount, e.frequency);
      catMap[e.category] = (catMap[e.category] || 0) + m;
    });

    const oneTimeTotal = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const recurringTotal = recurring.reduce((s, e) => s + getMonthlyEquivalent(e.amount, e.frequency), 0);
    const donutData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return { monthExpenses, oneTimeTotal, recurringTotal, totalSpent: oneTimeTotal + recurringTotal, categoryMap: catMap, donutData };
  }, [expenses, recurring, monthStart, monthEnd, selected.value]);

  const handleDownload = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 40;

    // Header
    doc.setFillColor(221, 107, 72); // coral
    doc.rect(0, 0, pageW, 80, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Expense Report', 40, 35);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(selected.label, 40, 58);
    if (budgetAmount > 0) {
      doc.text(`Budget: ${formatCurrency(budgetAmount, currency)}`, pageW - 40, 58, { align: 'right' });
    }
    y = 100;

    // Summary row
    doc.setTextColor(60, 40, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 40, y); y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`One-time expenses: ${formatCurrency(oneTimeTotal, currency)}`, 40, y); y += 15;
    doc.text(`Recurring (monthly est.): ${formatCurrency(recurringTotal, currency)}`, 40, y); y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatCurrency(totalSpent, currency)}`, 40, y); y += 25;

    // One-time expenses table
    if (monthExpenses.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('One-Time Expenses', 40, y); y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      // Table header
      doc.setFillColor(245, 235, 225);
      doc.rect(40, y - 12, pageW - 80, 16, 'F');
      doc.setTextColor(100, 70, 40);
      doc.text('Name', 48, y - 2);
      doc.text('Category', 260, y - 2);
      doc.text('Date', 360, y - 2);
      doc.text('Amount', pageW - 50, y - 2, { align: 'right' });
      y += 8;

      doc.setTextColor(40, 30, 20);
      monthExpenses.sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach((e, i) => {
        if (y > 760) { doc.addPage(); y = 40; }
        if (i % 2 === 0) { doc.setFillColor(252, 248, 244); doc.rect(40, y - 11, pageW - 80, 15, 'F'); }
        doc.text(e.name?.substring(0, 35) || '-', 48, y - 2);
        doc.text(e.category || '-', 260, y - 2);
        doc.text(e.date || '-', 360, y - 2);
        doc.text(formatCurrency(e.amount, currency), pageW - 50, y - 2, { align: 'right' });
        y += 15;
      });
      y += 10;
    }

    // Recurring table
    if (recurring.length > 0) {
      if (y > 680) { doc.addPage(); y = 40; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(60, 40, 20);
      doc.text('Recurring Expenses (Monthly Equivalent)', 40, y); y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      doc.setFillColor(245, 235, 225);
      doc.rect(40, y - 12, pageW - 80, 16, 'F');
      doc.setTextColor(100, 70, 40);
      doc.text('Name', 48, y - 2);
      doc.text('Category', 260, y - 2);
      doc.text('Frequency', 360, y - 2);
      doc.text('Monthly Est.', pageW - 50, y - 2, { align: 'right' });
      y += 8;

      doc.setTextColor(40, 30, 20);
      recurring.forEach((e, i) => {
        if (y > 760) { doc.addPage(); y = 40; }
        if (i % 2 === 0) { doc.setFillColor(252, 248, 244); doc.rect(40, y - 11, pageW - 80, 15, 'F'); }
        doc.text(e.name?.substring(0, 35) || '-', 48, y - 2);
        doc.text(e.category || '-', 260, y - 2);
        doc.text(e.frequency || '-', 360, y - 2);
        doc.text(formatCurrency(getMonthlyEquivalent(e.amount, e.frequency), currency), pageW - 50, y - 2, { align: 'right' });
        y += 15;
      });
      y += 10;
    }

    // Category breakdown
    if (y > 650) { doc.addPage(); y = 40; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(60, 40, 20);
    doc.text('Spending by Category', 40, y); y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
      if (y > 760) { doc.addPage(); y = 40; }
      doc.text(`${CATEGORY_ICONS[cat] || ''} ${cat}`, 48, y);
      doc.text(formatCurrency(amt, currency), pageW - 50, y, { align: 'right' });
      y += 14;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 130, 110);
    doc.text(`Generated by HomeSpend · ${format(new Date(), 'dd MMM yyyy')}`, 40, 820);

    doc.save(`expense-report-${selected.value}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md mx-auto max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header with month picker */}
        <div className="bg-primary px-5 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-primary-foreground font-bold text-base">Month History</DialogTitle>
            <Button size="sm" variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1.5 rounded-xl h-8 px-3" onClick={handleDownload}>
              <Download size={14} /> PDF
            </Button>
          </div>

          {/* Month selector */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setMonthIdx(i => Math.min(i + 1, 11))}
              disabled={monthIdx >= 11}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-foreground/15 disabled:opacity-30 text-primary-foreground"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-primary-foreground text-lg font-bold">{selected.label}</p>
              <p className="text-primary-foreground/70 text-xs">{formatCurrency(totalSpent, currency)} total</p>
            </div>
            <button
              onClick={() => setMonthIdx(i => Math.max(i - 1, 0))}
              disabled={monthIdx <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-foreground/15 disabled:opacity-30 text-primary-foreground"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-primary-foreground/10 rounded-xl p-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === id ? 'bg-white text-primary shadow-sm' : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'expenses' && (
            <ExpensesTab monthExpenses={monthExpenses} recurring={recurring} oneTimeTotal={oneTimeTotal} recurringTotal={recurringTotal} currency={currency} />
          )}
          {tab === 'insights' && (
            <InsightsTab donutData={donutData} totalSpent={totalSpent} categoryMap={categoryMap} currency={currency} />
          )}
          {tab === 'report' && (
            <ReportTab totalSpent={totalSpent} oneTimeTotal={oneTimeTotal} recurringTotal={recurringTotal} budgetAmount={budgetAmount} categoryMap={categoryMap} currency={currency} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExpensesTab({ monthExpenses, recurring, oneTimeTotal, recurringTotal, currency }) {
  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 bg-muted rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">One-time</p>
          <p className="font-bold text-foreground">{formatCurrency(oneTimeTotal, currency)}</p>
        </div>
        <div className="flex-1 bg-muted rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Recurring</p>
          <p className="font-bold text-foreground">{formatCurrency(recurringTotal, currency)}</p>
        </div>
      </div>

      {monthExpenses.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">One-Time</p>
          <div className="divide-y divide-border">
            {monthExpenses.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.category} · {e.date}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(e.amount, currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthExpenses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <span className="text-4xl">🧾</span>
          <p className="text-sm mt-2">No one-time expenses this month</p>
        </div>
      )}

      {recurring.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recurring (Monthly Est.)</p>
          <div className="divide-y divide-border">
            {recurring.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.category} · {e.frequency}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(getMonthlyEquivalent(e.amount, e.frequency), currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightsTab({ donutData, totalSpent, categoryMap, currency }) {
  return (
    <div className="px-5 py-4 space-y-4">
      <SpendingDonut data={donutData} totalMonthly={totalSpent} currency={currency} />
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Category</p>
        {Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
          <div key={cat} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#ADB5BD' }} />
              <span className="text-foreground">{cat}</span>
            </div>
            <span className="font-semibold text-foreground">{formatCurrency(amt, currency)}</span>
          </div>
        ))}
        {Object.keys(categoryMap).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No data for this month</p>
        )}
      </div>
    </div>
  );
}

function ReportTab({ totalSpent, oneTimeTotal, recurringTotal, budgetAmount, categoryMap, currency }) {
  const remaining = budgetAmount - totalSpent;
  const over = budgetAmount > 0 && totalSpent > budgetAmount;
  const pct = budgetAmount > 0 ? Math.min((totalSpent / budgetAmount) * 100, 100) : 0;
  const barColor = pct < 70 ? 'hsl(130 20% 58%)' : pct < 90 ? 'hsl(42 58% 58%)' : 'hsl(0 72% 60%)';

  return (
    <div className="px-5 py-4 space-y-5">
      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">One-time</span>
          <span className="font-semibold text-foreground">{formatCurrency(oneTimeTotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Recurring (est.)</span>
          <span className="font-semibold text-foreground">{formatCurrency(recurringTotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-border pt-2 mt-1">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-primary">{formatCurrency(totalSpent, currency)}</span>
        </div>
      </div>

      {/* Budget progress */}
      {budgetAmount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-semibold">{formatCurrency(budgetAmount, currency)}</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pct.toFixed(0)}% used</span>
            <span className={over ? 'text-destructive font-semibold' : ''}>
              {over ? `Over by ${formatCurrency(Math.abs(remaining), currency)}` : `${formatCurrency(remaining, currency)} remaining`}
            </span>
          </div>
        </div>
      )}
      {!budgetAmount && (
        <p className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
          💡 No budget was set for this month.
        </p>
      )}

      <div className="border-t border-border" />

      {/* Category breakdown */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Category</p>
        {Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
          <div key={cat} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#ADB5BD' }} />
                <span className="text-foreground">{cat}</span>
              </div>
              <span className="font-semibold text-foreground">{formatCurrency(amt, currency)}</span>
            </div>
          </div>
        ))}
        {Object.keys(categoryMap).length === 0 && (
          <p className="text-sm text-muted-foreground">No spending data this month.</p>
        )}
      </div>
    </div>
  );
}