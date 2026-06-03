import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. About This App',
    content: (
      <>
        <p>HomeSpend is a shared home expense tracker available at <strong>newhearths.com</strong>. It helps households manage budgets, recurring bills, and one-time expenses in one place.</p>
        <p className="mt-2">This privacy policy explains what personal data we collect, how we store it, and what we do — and don't do — with it.</p>
      </>
    ),
  },
  {
    title: '2. Data We Collect',
    content: (
      <ul className="list-disc list-inside space-y-1.5">
        <li><strong>Google account info</strong> — your name and email address, collected when you sign in with Google.</li>
        <li><strong>Home data</strong> — home names, currencies, and the members you invite.</li>
        <li><strong>Expense data</strong> — expense names, amounts, dates, categories, notes, and recurrence settings you enter.</li>
        <li><strong>Budget data</strong> — monthly budget targets you set per home.</li>
        <li><strong>Activity logs</strong> — a record of who made changes within a shared home, for transparency between members.</li>
      </ul>
    ),
  },
  {
    title: '3. How Your Data Is Stored',
    content: (
      <>
        <p>All data is stored securely on <strong>Supabase</strong>, an encrypted cloud database platform. Data is hosted on infrastructure in <strong>Australia</strong> and protected by:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Encryption at rest and in transit (TLS/SSL)</li>
          <li>Row-level security — you can only access homes you belong to</li>
          <li>Google OAuth authentication — we never see or store your Google password</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Data Sharing',
    content: (
      <>
        <p>We <strong>never sell, rent, or share</strong> your personal data with third parties for any purpose.</p>
        <p className="mt-2">Your data may be visible to:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>Other home members</strong> — users you invite to a shared home can see that home's expenses and activity log.</li>
          <li><strong>Supabase</strong> — as our infrastructure provider, Supabase processes data on our behalf under their own privacy policy.</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Email Notifications',
    content: (
      <p>We only send emails for <strong>home invite notifications</strong> — when someone invites you to join a home on HomeSpend. We will <strong>never</strong> send marketing emails, newsletters, or promotional content.</p>
    ),
  },
  {
    title: '6. Data Retention & Deletion',
    content: (
      <>
        <p>Your data is kept for as long as your account is active. You can delete your account at any time from the Homes tab — this permanently and immediately deletes all your data with no recovery.</p>
        <p className="mt-2">Individual homes and expenses can be deleted at any time within the app.</p>
      </>
    ),
  },
  {
    title: '7. Beta Disclaimer',
    content: (
      <p>HomeSpend is currently in <strong>beta</strong>. The app is provided as-is, without warranty of any kind. Use it at your own risk. We recommend not relying on HomeSpend as your sole financial record. We may need to reset or migrate data as the product evolves and will communicate this where possible.</p>
    ),
  },
  {
    title: '8. Contact',
    content: (
      <>
        <p>Questions about your data or this policy? Reach us at:</p>
        <a
          href="mailto:gouravaragkar@gmail.com"
          className="inline-block mt-2 text-primary font-medium hover:underline"
        >
          gouravaragkar@gmail.com
        </a>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
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
            <ShieldCheck size={18} className="text-primary" />
            <span className="font-semibold text-foreground">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-20 space-y-8">
        {/* Intro badge */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">HomeSpend Privacy Policy</h1>
            <p className="text-xs text-muted-foreground mt-0.5">newhearths.com · Last updated June 2026</p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ title, content }) => (
          <div key={title} className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {content}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Link to="/" className="text-xs text-primary hover:underline">
            ← Back to HomeSpend
          </Link>
          <span className="text-xs text-muted-foreground">newhearths.com</span>
        </div>
      </div>
    </div>
  );
}
