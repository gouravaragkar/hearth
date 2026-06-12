import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight, FileUp, Sparkles } from 'lucide-react';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fade-up">
      <span className="text-6xl mb-4">🏡</span>
      <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to HomeSpend</h1>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        Track household bills, recurring expenses, and monthly budgets — all in one place.
      </p>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Choose how to get started</p>

      <div className="w-full max-w-sm space-y-3">

        {/* Path A — Manual setup */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 text-left shadow-warm-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Home size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Set up manually</p>
              <p className="text-xs text-muted-foreground">Create a home and add expenses yourself</p>
            </div>
          </div>
          <div className="space-y-2 mb-3 pl-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              Create a home with your currency
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              Add recurring bills and expenses
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              Track spending and set a budget
            </div>
          </div>
          <Link to="/homes">
            <Button className="w-full rounded-xl gap-2 h-10">
              Create your first Home <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Path B — Import */}
        <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Quick start with AI ✨</p>
              <p className="text-xs text-muted-foreground">Upload a bank statement — we handle the rest</p>
            </div>
          </div>
          <div className="space-y-2 mb-3 pl-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold shrink-0 text-primary">1</span>
              Upload your PDF bank statement
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold shrink-0 text-primary">2</span>
              AI extracts and categorises transactions
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold shrink-0 text-primary">3</span>
              Review and import in one tap
            </div>
          </div>
          <button
            onClick={() => navigate('/import')}
            className="w-full bg-primary text-primary-foreground rounded-xl h-10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <FileUp size={16} /> Import bank statement
          </button>
        </div>

      </div>
    </div>
  );
}
