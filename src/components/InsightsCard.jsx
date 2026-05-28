import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SpendingTrend from '@/components/SpendingTrend';
import SpendingDonut from '@/components/SpendingDonut';

export default function InsightsCard({ open, onClose, expenses, recurring, donutData, totalMonthly, topCategory }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Insights</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pb-2">
          <div>
            <h3 className="font-semibold text-foreground mb-3">6 Month Trend</h3>
            <SpendingTrend expenses={expenses} recurring={recurring} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">Spending Breakdown</h3>
              {topCategory && (
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-1">
                  Top: {topCategory.name}
                </span>
              )}
            </div>
            <SpendingDonut data={donutData} totalMonthly={totalMonthly} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}