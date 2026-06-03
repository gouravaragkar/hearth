import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Last updated: June 2025</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          HomeSpend is a personal finance app built to help households track shared expenses. We take your privacy seriously. This policy explains what data we collect, how we store it, and what we do with it.
        </p>

        <Section title="1. Data We Collect">
          <p>When you use HomeSpend, we collect the following:</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
            <li><strong className="text-foreground">Account information</strong> — your name and email address from your Google account, collected when you sign in via Google OAuth.</li>
            <li><strong className="text-foreground">Home data</strong> — home names, currencies, and the list of members you invite.</li>
            <li><strong className="text-foreground">Expense data</strong> — expense names, amounts, dates, categories, notes, and recurrence settings that you enter into the app.</li>
            <li><strong className="text-foreground">Budget data</strong> — monthly budget targets you set per home.</li>
            <li><strong className="text-foreground">Activity logs</strong> — a history of changes made within a home (who added or edited an expense) for shared-home transparency.</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> collect payment information, location data, or any data from your device beyond what you explicitly enter.</p>
        </Section>

        <Section title="2. How Your Data Is Stored">
          <p>All data is stored securely in <strong className="text-foreground">Supabase</strong>, a cloud database platform that provides:</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
            <li>Encryption at rest and in transit (TLS/SSL)</li>
            <li>Row-level security so you can only access homes you belong to</li>
            <li>Servers hosted on AWS infrastructure (us-east-1 region by default)</li>
          </ul>
          <p className="mt-3">Authentication is handled via <strong className="text-foreground">Supabase Auth with Google OAuth</strong> — we never see or store your Google password.</p>
        </Section>

        <Section title="3. Data Sharing">
          <p>We do <strong className="text-foreground">not</strong> sell, rent, or share your personal data with any third parties for marketing or advertising purposes.</p>
          <p className="mt-2">Your data may be visible to:</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
            <li><strong className="text-foreground">Other home members</strong> — if you share a home with another user, they can see the expenses and activity log for that home.</li>
            <li><strong className="text-foreground">Supabase</strong> — as our infrastructure provider, Supabase processes data on our behalf under their own privacy policy.</li>
          </ul>
        </Section>

        <Section title="4. Data Retention & Deletion">
          <p>Your data is retained for as long as your account exists. You can delete your account at any time from the user menu — this permanently deletes all your homes, expenses, and associated data with no recovery.</p>
          <p className="mt-2">You can also delete individual homes or expenses at any time within the app.</p>
        </Section>

        <Section title="5. Beta Disclaimer">
          <p>HomeSpend is currently in <strong className="text-foreground">beta</strong>. While we take care to protect your data, the app may have bugs or unexpected behaviour. We recommend not relying on HomeSpend as your sole record of financial information during the beta period.</p>
          <p className="mt-2">We reserve the right to reset or migrate data as the product evolves, and will notify users where possible before any such action.</p>
        </Section>

        <Section title="6. Cookies & Analytics">
          <p>HomeSpend does not use advertising cookies or third-party analytics trackers. We may use minimal session data (stored in your browser's local storage) to keep you logged in.</p>
        </Section>

        <Section title="7. Contact">
          <p>If you have any questions or requests about your data, please contact us at:</p>
          <a
            href="mailto:privacy@homespend.app"
            className="inline-block mt-2 text-sm text-primary font-medium hover:underline"
          >
            privacy@homespend.app
          </a>
        </Section>

        <div className="pt-4 border-t border-border">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Back to HomeSpend
          </Link>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}
