import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, RefreshCw, Receipt, CalendarDays, LogOut, Share2, Copy, Check, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const TABS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, component: Dashboard },
  { label: 'Recurring', path: '/recurring', icon: RefreshCw, component: RecurringExpenses },
  { label: 'One-Time', path: '/one-time', icon: Receipt, component: OneTimeExpenses },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays, component: CalendarPage },
];

function UserMenu() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const referralLink = `${window.location.origin}?ref=${user?.id || 'homespend'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = () => base44.auth.logout('/');

  const handleDeleteAccount = async () => {
    if (user?.id) await base44.entities.User.delete(user.id).catch(() => {});
    base44.auth.logout('/');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 min-h-[44px] min-w-[44px] bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm select-none"
          >
            {initials}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 rounded-xl">
          <div className="px-3 py-2.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>
          <DropdownMenuSeparator />

          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
              <Share2 size={11} /> Share HomeSpend
            </p>
            <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1.5">
              <span className="text-xs text-muted-foreground truncate flex-1">{referralLink}</span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 text-primary hover:text-primary/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center select-none"
              >
                {copied ? <Check size={13} className="text-sage" /> : <Copy size={13} />}
              </button>
            </div>
            {copied && <p className="text-xs text-sage mt-1">Link copied!</p>}
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer min-h-[44px] select-none"
          >
            <LogOut size={14} className="mr-2" /> Sign out
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive cursor-pointer min-h-[44px] select-none"
          >
            <Trash2 size={14} className="mr-2" /> Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

const slideVariants = {
  enterFromRight: { x: '100%', opacity: 0 },
  enterFromLeft: { x: '-100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitToLeft: { x: '-100%', opacity: 0 },
  exitToRight: { x: '100%', opacity: 0 },
};

export default function Layout() {
  const location = useLocation();
  const currentIdx = TABS.findIndex(t => t.path === location.pathname);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;
  const prevIdxRef = useRef(activeIdx);
  const [direction, setDirection] = useState(0); // 1 = going right, -1 = going left

  useEffect(() => {
    const prev = prevIdxRef.current;
    if (prev !== activeIdx) {
      setDirection(activeIdx > prev ? 1 : -1);
      prevIdxRef.current = activeIdx;
    }
  }, [activeIdx]);

  return (
    <div className="min-h-screen bg-background font-inter flex flex-col overflow-hidden">
      {/* Top Header */}
      <header
        className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 select-none">
              <span className="text-xl">🏡</span>
              <span className="font-semibold text-foreground text-lg tracking-tight">HomeSpend</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Tab content — keep all mounted, slide between them */}
      <div className="flex-1 relative overflow-hidden">
        <div className="max-w-3xl mx-auto h-full w-full relative">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeIdx}
              custom={direction}
              variants={slideVariants}
              initial={direction === 1 ? 'enterFromRight' : 'enterFromLeft'}
              animate="center"
              exit={direction === 1 ? 'exitToLeft' : 'exitToRight'}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 overflow-y-auto"
              style={{ overscrollBehavior: 'none' }}
            >
              {TABS.map((tab, i) => {
                const Component = tab.component;
                return (
                  <div key={tab.path} style={{ display: i === activeIdx ? 'block' : 'none' }}>
                    <Component />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-around px-2">
          {TABS.map(({ label, path, icon: Icon }, i) => {
            const active = i === activeIdx;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] select-none transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}