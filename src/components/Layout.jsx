import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, RefreshCw, Receipt, CalendarDays, LogOut, Share2, Copy, Check, Trash2, Home, ChevronLeft, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Dashboard from '@/pages/Dashboard';
import RecurringExpenses from '@/pages/RecurringExpenses';
import OneTimeExpenses from '@/pages/OneTimeExpenses';
import CalendarPage from '@/pages/CalendarPage';
import HomesPage from '@/pages/HomesPage';
import HomeSwitcher from '@/components/HomeSwitcher';
import AssistantChat from '@/pages/AssistantChat';

const TABS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, component: Dashboard },
  { label: 'Recurring', path: '/recurring', icon: RefreshCw, component: RecurringExpenses },
  { label: 'One-Time', path: '/one-time', icon: Receipt, component: OneTimeExpenses, shortLabel: 'One-Off' },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays, component: CalendarPage },
  { label: 'Homes', path: '/homes', icon: Home, component: HomesPage },
  { label: 'Assistant', path: '/assistant', icon: Sparkles, component: AssistantChat, comingSoon: true },
];

function UserMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data: { user } }) => setUser(user))
      .catch(() => {});
  }, []);

  // Close on outside click — always registered, not gated on open
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const fullName = user?.user_metadata?.full_name || user?.email || '';
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const referralLink = `${window.location.origin}?ref=${user?.id || 'homespend'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    try {
      if (user?.id) {
        await supabase.from('homes').delete().eq('created_by', user.id);
      }
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e) {
      console.error('Error deleting account:', e);
      await supabase.auth.signOut();
      window.location.href = '/';
    }
  };

  return (
    <>
      <div ref={menuRef} className="relative shrink-0" style={{ zIndex: 100 }}>
        <button
          type="button"
          onPointerDown={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          className="rounded-full h-10 w-10 bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          {initials}
        </button>

        {open && (
          <div
            className="absolute right-0 top-12 w-60 bg-card border border-border rounded-xl shadow-lg py-1"
            style={{ zIndex: 100 }}
          >
            <div className="px-3 py-2.5 flex items-center gap-3 border-b border-border">
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              </div>
            </div>

            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
                <Share2 size={11} /> Share HomeSpend
              </p>
              <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1.5">
                <span className="text-xs text-muted-foreground truncate flex-1">{referralLink}</span>
                <button type="button" onClick={handleCopyLink} className="shrink-0 text-primary text-xs px-1">
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
              {copied && <p className="text-xs text-primary mt-1">Link copied!</p>}
            </div>

            <div className="border-t border-border">
              <Link
                to="/changelog"
                onClick={() => setOpen(false)}
                className="w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 transition-colors"
              >
                📋 What's New
              </Link>
              <Link
                to="/privacy"
                onClick={() => setOpen(false)}
                className="w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 transition-colors"
              >
                🔒 Privacy Policy
              </Link>
            </div>

            <div className="border-t border-border">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2.5 text-sm text-destructive hover:bg-muted flex items-center gap-2"
              >
                <LogOut size={14} /> Sign out
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setDeleteDialogOpen(true); }}
                className="w-full text-left px-3 py-2.5 text-sm text-destructive hover:bg-muted flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIdx = TABS.findIndex(t => t.path === location.pathname);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;
  const prevIdxRef = useRef(activeIdx);
  const [direction, setDirection] = useState(0);
  const scrollRefs = useRef(TABS.map(() => null));

  useEffect(() => {
    setDirection(activeIdx > prevIdxRef.current ? 1 : -1);
    prevIdxRef.current = activeIdx;
  }, [activeIdx]);

  const setScrollRef = useCallback((el, i) => {
    scrollRefs.current[i] = el;
  }, []);

  const handleTabClick = (path, i) => {
    if (i === activeIdx) {
      const el = scrollRefs.current[i];
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isRoot = location.pathname === '/';

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '15%' : '-15%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-15%' : '15%', opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background font-inter flex flex-col overflow-hidden">
      <header
        className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 select-none">
              {!isRoot && (
                <button
                  onClick={() => navigate(-1)}
                  className="mr-1 -ml-1 h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors select-none"
                  aria-label="Go back"
                >
                  <ChevronLeft size={22} className="text-foreground" />
                </button>
              )}
              <img src="/logo.png" alt="HomeSpend" className="h-7 w-auto" />
              <span className="font-semibold text-foreground text-lg tracking-tight">HomeSpend</span>
            </div>
            <div className="hidden sm:block shrink-0"><UserMenu /></div>
          </div>
          <div className="pb-2">
            <HomeSwitcher />
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute inset-0">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeIdx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.1, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {TABS[activeIdx].path === '/assistant' ? (
                <div className="h-full flex flex-col max-w-3xl mx-auto w-full pb-16">
                  <AssistantChat />
                </div>
              ) : (
                <div
                  ref={(el) => setScrollRef(el, activeIdx)}
                  className="h-full overflow-y-auto"
                  style={{ overscrollBehavior: 'none' }}
                >
                  <div className="max-w-3xl mx-auto w-full pb-20">
                    {(() => {
                      const Component = TABS[activeIdx].component;
                      return <Component />;
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {TABS.map((tab, i) => {
            if (i === activeIdx) return null;
            const Component = tab.component;
            return (
              <div
                key={tab.path}
                ref={(el) => setScrollRef(el, i)}
                style={{ display: 'none', overscrollBehavior: 'none' }}
              >
                <Component />
              </div>
            );
          })}
        </div>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-around px-0">
          {TABS.map((tab, i) => {
            const { label, path, icon: Icon } = tab;
            const active = i === activeIdx;
            if (tab.comingSoon) {
              return (
                <div
                  key={path}
                  title="Coming soon"
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[52px] select-none opacity-40 relative cursor-not-allowed"
                >
                  <Icon size={18} strokeWidth={1.7} />
                  <span className="text-[10px] font-medium">{label}</span>
                  <span className="absolute -top-0.5 right-3 text-[8px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded-full">Soon</span>
                </div>
              );
            }
            return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => handleTabClick(path, i)}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[52px] select-none transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
                  <span className="text-[10px] font-medium">{tab.shortLabel || label}</span>
                </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}