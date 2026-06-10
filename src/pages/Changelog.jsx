import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

const releases = [
  {
    version: 'v1.6.0',
    date: 'June 2026',
    name: 'AI Assistant Release 🤖',
    sections: [
      {
        type: 'feature',
        label: 'New Features',
        items: [
          'AI Assistant powered by Claude — chat naturally to manage your finances',
          'Log expenses by chatting — \'Add $120 electricity bill\' and it\'s done',
          'Log recurring expenses via chat — \'Add $800 monthly rent\'',
          'Ask questions about your spending — \'How much did I spend this month?\'',
          'Chat history preserved within your session — switching tabs won\'t lose context',
          'Last session archive — restore your previous chat when you log back in',
        ],
      },
      {
        type: 'improvement',
        label: 'Improvements',
        items: [
          'Assistant uses today\'s date automatically for accurate expense logging',
          'Expenses added via assistant reflect instantly in dashboard and reports',
        ],
      },
    ],
  },
  {
    version: 'v1.5.0',
    date: 'June 2026',
    name: 'Guest Mode & Data Migration Release',
    sections: [
      {
        type: 'feature',
        label: 'New Features',
        items: [
          'Guest mode — try HomeSpend instantly without signing up',
          'Guest data stored for 7 days with countdown banner',
          'Seamless data migration when guest upgrades to Google account',
          'Auto-cleanup of expired guest data runs daily at 3am',
          'Timezone-based currency detection for guest home setup',
          '\'Try as Guest\' option on landing page and login page',
        ],
      },
      {
        type: 'improvement',
        label: 'Improvements',
        items: [
          'User menu shows guest icon for anonymous users',
          'Guest banner shows days remaining with sign up prompt',
        ],
      },
      {
        type: 'fix',
        label: 'Bug Fixes',
        items: [
          'Fixed: Service worker no longer blocks authentication requests',
        ],
      },
    ],
  },
  {
    version: 'v1.4.0',
    date: 'June 2026',
    name: 'New Domain & Landing Page Release',
    sections: [
      {
        type: 'feature',
        label: 'New Features',
        items: [
          'Official domain migration to myhomespend.com — app now accessible at www.myhomespend.com',
          'Professional marketing landing page — visitors now see full product story before signing up',
          'Official HomeSpend logo introduced across the app, login page, PWA icon and landing page',
          'newhearths.com permanently redirects to myhomespend.com — old links still work',
        ],
      },
      {
        type: 'improvement',
        label: 'Improvements',
        items: [
          'Privacy Policy and Changelog links fixed and accessible from landing page footer',
          'All app references updated to myhomespend.com',
        ],
      },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'June 2026',
    name: 'Landing Page & Branding Release',
    sections: [
      {
        type: 'feature',
        label: 'New Features',
        items: [
          'Professional marketing landing page at myhomespend.com — visitors now see the full product story before signing up',
          'Official HomeSpend logo introduced across the app, login page and PWA icon',
          'Semi-Annual and Annual recurring expense frequency options added',
          'Category and Frequency dropdowns now open inline instead of full screen',
        ],
      },
      {
        type: 'improvement',
        label: 'Improvements',
        items: [
          'Privacy Policy and Changelog accessible from landing page footer',
        ],
      },
      {
        type: 'fix',
        label: 'Bug Fixes',
        items: [
          'Fixed: Landing page Privacy Policy and Changelog links now working correctly',
        ],
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'June 2026',
    name: 'Mobile Polish Release',
    sections: [
      {
        type: 'improvement',
        label: 'Improvements',
        items: [
          'Complete mobile UI overhaul across all tabs',
          'Expense cards redesigned with 2-row layout — no more overlapping text',
          'HomeSwitcher moved to header as compact pill',
          'User menu accessible from Homes tab on mobile',
          'Tab bar icons and labels optimised for mobile screens',
          'Monthly Summary redesigned as 2-column grid',
          'Page headers reduced for better mobile fit',
          'Category and Frequency dropdowns now open inline',
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'June 2026',
    name: 'Infrastructure & Features Release',
    sections: [
      {
        type: 'feature',
        label: 'New Features',
        items: [
          'Migrated from Base44 to Supabase + Vercel (full data ownership)',
          'Added Semi-Annual and Annual recurring expense frequencies',
          'PWA support — install HomeSpend directly from your browser',
          'Email notifications for home invitations via Resend',
          'Privacy Policy page added',
        ],
      },
      {
        type: 'fix',
        label: 'Bug Fixes',
        items: [
          'Fixed: recurring expenses incorrectly showing in past months on history',
          'Fixed: spending trend chart showing wrong historical data',
          'Fixed: quarterly expenses calendar bug',
          'Fixed: form validation now shows error messages instead of silent failure',
          'Fixed: invite approval flow fully working end to end',
          'Security: 10 vulnerabilities patched, 0 remaining',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'June 2026',
    name: 'Initial Beta Launch 🎉',
    sections: [
      {
        type: 'feature',
        label: 'New Features',
        items: [
          'Dashboard with monthly summary and upcoming payments',
          'Recurring expense tracking (weekly, fortnightly, monthly, quarterly)',
          'One-time expense tracking across 10 categories',
          'Multi-home support with multi-currency (30+ currencies)',
          'Shared homes — invite family and housemates',
          'Calendar view of all bills and expenses',
          'Monthly budget tracking with progress bar',
          'Spending insights and 6-month trend chart',
          'Monthly PDF report export',
          'Activity log for shared homes',
          'Google authentication',
        ],
      },
    ],
  },
];

const DOT_COLORS = {
  feature: 'bg-primary',
  improvement: 'bg-blue-400',
  fix: 'bg-amber-400',
};

const LABEL_COLORS = {
  feature: 'text-primary bg-primary/10',
  improvement: 'text-blue-500 bg-blue-500/10',
  fix: 'text-amber-600 bg-amber-500/10',
};

export default function Changelog() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span className="font-semibold text-foreground">Changelog</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground">Release Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">What's new in HomeSpend · myhomespend.com</p>
        </div>

        <div className="space-y-10">
          {releases.map((release) => (
            <div key={release.version}>
              {/* Version header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                  {release.version}
                </span>
                <div>
                  <span className="font-semibold text-foreground text-sm">{release.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{release.date}</span>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4 pl-1">
                {release.sections.map((section) => (
                  <div key={section.label}>
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2 ${LABEL_COLORS[section.type]}`}>
                      {section.label}
                    </span>
                    <ul className="space-y-1.5">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[section.type]}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-px bg-border" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between">
          <Link to="/" className="text-xs text-primary hover:underline">← Back to HomeSpend</Link>
          <span className="text-xs text-muted-foreground">myhomespend.com</span>
        </div>
      </div>
    </div>
  );
}
