import { Link } from 'react-router-dom';


const PAIN_POINTS = [
  {
    emoji: '😩',
    title: 'Bills sneaking up on you',
    desc: "You only remember rent is due when it's already late.",
  },
  {
    emoji: '📊',
    title: 'Spreadsheets that nobody updates',
    desc: "Shared expense tracking that falls apart within a week.",
  },
  {
    emoji: '🌏',
    title: 'Living across cities or countries',
    desc: 'Managing homes in different currencies with no single view.',
  },
];

const FEATURES = [
  { emoji: '🔄', title: 'Recurring Bills', desc: 'Track weekly, fortnightly, monthly, quarterly, semi-annual and annual bills in one place.' },
  { emoji: '🧾', title: 'One-Time Expenses', desc: 'Log any spend across 10 categories instantly — groceries, dining, repairs and more.' },
  { emoji: '👨‍👩‍👧', title: 'Shared Homes', desc: 'Invite your partner or housemates. Everyone sees the same view, no confusion.' },
  { emoji: '🌏', title: 'Multi-Currency', desc: 'Manage homes in AUD, INR, USD, GBP and 30+ currencies with automatic conversion.' },
  { emoji: '📊', title: 'Budget & Insights', desc: 'Set a monthly budget, track spending trends, and export PDF reports.' },
  {
    emoji: '🤖',
    title: 'AI Assistant',
    desc: 'Just chat to log expenses and ask about your spending.',
    badge: 'Coming Soon',
  },
];

const STEPS = [
  { n: '1', title: 'Create your Home', desc: 'Set up your household in under a minute — name it, pick a currency, invite members.' },
  { n: '2', title: 'Add your bills', desc: 'Log recurring subscriptions, rent, utilities and one-off expenses with a few taps.' },
  { n: '3', title: 'Stay in control', desc: 'Your dashboard shows everything at a glance — upcoming bills, monthly spend, budget status.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF7ED] text-foreground">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#FFF7ED]/90 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <img src="/logo.png" alt="HomeSpend" className="h-8 w-auto" />
            <span className="font-bold text-lg text-[#C2410C]">HomeSpend</span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-[#C2410C] border border-[#C2410C]/30 px-4 py-1.5 rounded-full hover:bg-[#C2410C]/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="HomeSpend" className="h-16 w-auto" />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-[#C2410C]/10 text-[#C2410C] text-xs font-semibold px-3 py-1 rounded-full mb-6">
          ✨ No app store needed — works on any device
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          Your home finances,<br className="hidden sm:block" /> finally under control
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
          Track bills, share expenses with your household, and always know where your money goes — across one home or many.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="w-full sm:w-auto bg-[#C2410C] text-white font-semibold px-8 py-3 rounded-2xl hover:bg-[#9a3310] transition-colors text-sm shadow-md"
          >
            Get Started Free
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto border border-gray-300 text-gray-700 font-medium px-8 py-3 rounded-2xl hover:bg-white transition-colors text-sm"
          >
            See how it works
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-4">Free to use · Sign in with Google · No credit card</p>
        <p className="mt-3">
          <Link to="/login" className="text-sm text-gray-500 hover:text-[#C2410C] transition-colors">
            No account needed · Try as guest →
          </Link>
        </p>
      </section>

      {/* ── Pain Points ── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">Sound familiar?</h2>
        <p className="text-center text-gray-500 text-sm mb-8">HomeSpend is built for real households dealing with real problems.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PAIN_POINTS.map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">Everything your household needs</h2>
          <p className="text-center text-gray-500 text-sm mb-10">One app for every home, every currency, every family setup.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ emoji, title, desc, badge }) => (
              <div key={title} className="bg-[#FFF7ED] rounded-2xl p-4 border border-orange-100 relative">
                {badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-[#C2410C] bg-[#C2410C]/10 px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
                <div className="text-2xl mb-2">{emoji}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">How it works</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Up and running in under 2 minutes.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#C2410C] text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md">
                {n}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#C2410C] py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to take control of your home finances?
          </h2>
          <p className="text-orange-200 text-sm mb-6">Free to use. No app store needed. Works on any device.</p>
          <Link
            to="/login"
            className="inline-block bg-white text-[#C2410C] font-bold px-10 py-3 rounded-2xl hover:bg-orange-50 transition-colors text-sm shadow-md"
          >
            Get Started Free
          </Link>
          <div className="mt-6 text-xs text-orange-200 space-y-1">
            <p>📱 Install as an app on iPhone: Share → Add to Home Screen</p>
            <p>🤖 Install on Android: Menu → Install App</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#FFF7ED] border-t border-orange-100 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© 2026 HomeSpend · <a href="https://myhomespend.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">myhomespend.com</a></span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link to="/changelog" className="hover:text-gray-600 transition-colors">Changelog</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
