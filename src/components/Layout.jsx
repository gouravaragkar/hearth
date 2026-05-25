import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, RefreshCw, Receipt, LogOut, Share2, Copy, Check, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Recurring', path: '/recurring', icon: RefreshCw },
  { label: 'One-Time', path: '/one-time', icon: Receipt },
];

function UserMenu() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const referralLink = `${window.location.origin}?ref=${user?.id || 'homespend'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = () => {
    base44.auth.logout('/');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm">
          {initials}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl">
        {/* Profile info */}
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

        {/* Share / Referral */}
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
            <Share2 size={11} /> Share HomeSpend
          </p>
          <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1.5">
            <span className="text-xs text-muted-foreground truncate flex-1">{referralLink}</span>
            <button
              onClick={handleCopyLink}
              className="shrink-0 text-primary hover:text-primary/80 transition-colors"
              title="Copy link"
            >
              {copied ? <Check size={13} className="text-sage" /> : <Copy size={13} />}
            </button>
          </div>
          {copied && <p className="text-xs text-sage mt-1">Link copied!</p>}
        </div>
        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut size={14} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏡</span>
              <span className="font-semibold text-foreground text-lg tracking-tight">HomeSpend</span>
            </div>
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1 bg-muted rounded-full px-1 py-1">
                {navItems.map(({ label, path, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-warm-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  );
                })}
              </nav>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}