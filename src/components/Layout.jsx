import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, RefreshCw, Receipt } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Recurring', path: '/recurring', icon: RefreshCw },
  { label: 'One-Time', path: '/one-time', icon: Receipt },
];

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