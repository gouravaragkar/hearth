import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';

export default function ExpenseFilters({ category, setCategory, monthOffset, setMonthOffset, showMonthPicker = true }) {
  const displayMonth = format(addMonths(new Date(), monthOffset), 'MMMM yyyy');
  const isCurrentMonth = monthOffset === 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Month picker */}
      {showMonthPicker && (
        <div className="flex items-center gap-1 bg-muted rounded-xl px-1">
          <button
            onClick={() => setMonthOffset(monthOffset - 1)}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-border transition-colors select-none"
          >
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[110px] text-center select-none">{displayMonth}</span>
          <button
            onClick={() => setMonthOffset(monthOffset + 1)}
            disabled={isCurrentMonth}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-border transition-colors disabled:opacity-30 select-none"
          >
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {!isCurrentMonth && showMonthPicker && (
        <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xl" onClick={() => setMonthOffset(0)}>
          Today's month
        </Button>
      )}

      {/* Category filter */}
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="h-8 rounded-xl text-sm w-auto min-w-[130px] border-border bg-muted border-0">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {category !== 'all' && (
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setCategory('all')}>
          <X size={13} />
        </Button>
      )}
    </div>
  );
}