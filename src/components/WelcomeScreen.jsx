import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Receipt, BarChart2, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: Home, label: 'Create a Home', desc: 'Set up your household with a name and currency', color: 'bg-primary/10 text-primary' },
  { icon: Receipt, label: 'Add your bills', desc: 'Log recurring and one-time expenses', color: 'bg-secondary/10 text-secondary' },
  { icon: BarChart2, label: 'Track your spending', desc: 'See insights, budgets and upcoming payments', color: 'bg-accent/10 text-accent' },
];

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fade-up">
      <span className="text-6xl mb-4">🏡</span>
      <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to HomeSpend</h1>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        Track household bills, recurring expenses, and monthly budgets — all in one place.
      </p>

      <Link to="/homes">
        <Button size="lg" className="rounded-2xl gap-2 px-6 shadow-warm-md mb-10">
          Create your first Home <ArrowRight size={18} />
        </Button>
      </Link>

      <div className="w-full max-w-sm space-y-3">
        {STEPS.map(({ icon: Icon, label, desc, color }, i) => (
          <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-2xl px-4 py-3 text-left shadow-warm-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Step {i + 1}</p>
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}