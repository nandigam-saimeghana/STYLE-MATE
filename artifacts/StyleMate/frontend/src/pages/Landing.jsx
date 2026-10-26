import { Link } from 'react-router-dom'
import { Sparkles, Shirt, Layers, CloudSun, ArrowRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-brand-50">
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-ink-900">StyleMate</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Your AI Style Companion
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-900 leading-tight max-w-3xl mx-auto">
          Dress better every day with your{' '}
          <span className="text-brand-600">personal style assistant</span>
        </h1>
        <p className="mt-6 text-lg text-ink-600 max-w-2xl mx-auto">
          Digitize your wardrobe, discover outfit combinations, and get smart recommendations based on occasion, weather, and your unique style.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-6 py-3">
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-3">
            Try Demo Account
          </Link>
        </div>
        <p className="mt-4 text-sm text-ink-400">
          Demo: demo@stylemate.app / demo1234
        </p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shirt, title: 'Digital Wardrobe', desc: 'Catalog every piece with color, season, occasion and photos.' },
            { icon: Layers, title: 'Outfit Builder', desc: 'Create and save complete looks. Track what you wear.' },
            { icon: Sparkles, title: 'Smart Recommendations', desc: 'Rule-based engine suggests outfits for any occasion.' },
            { icon: CloudSun, title: 'Weather Aware', desc: 'Get suggestions that match the temperature and conditions.' },
          ].map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 py-8 text-center text-sm text-ink-400">
        StyleMate — Full Stack Personal Style Assistant · Built for learning & portfolio
      </footer>
    </div>
  )
}
