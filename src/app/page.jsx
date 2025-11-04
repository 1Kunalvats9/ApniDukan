'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  PackageCheck,
  BarChart4,
  Receipt,
  Printer,
  Users,
  ArrowRight,
  Zap,
  Shield
} from 'lucide-react';
// Removed custom smooth scroll/animation libs for a cleaner feel

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const id = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full opacity-[0.20]" style={{ background: 'radial-gradient(closest-side, rgba(147,51,234,0.35), transparent)', animation: 'slowFloat 30s linear infinite' }}></div>
        <div className="absolute -bottom-40 -right-28 h-[28rem] w-[28rem] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(closest-side, rgba(99,102,241,0.30), transparent)', animation: 'slowFloat 36s linear infinite reverse' }}></div>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px', color: '#0f172a' }}></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-semibold">A</div>
            <span className="ml-2 text-xl font-semibold tracking-tight">ApniDukaan</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-300/40 rounded-md px-2 py-1">Features</Link>
            <Link href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-300/40 rounded-md px-2 py-1">Testimonials</Link>
            <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-300/40 rounded-md px-2 py-1">Pricing</Link>
            <Link href={isLoggedIn ? '/portal/dashboard' : '/login'} className="text-sm text-slate-700 border border-slate-300 hover:bg-white rounded-full px-4 py-2 focus:outline-none focus:ring-4 focus:ring-purple-300/40">Sign In</Link>
            <Link href={isLoggedIn ? '/portal/dashboard' : '/login'} className="text-sm font-medium rounded-full px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-400/50">Get Started</Link>
          </div>
          <button aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)} className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-white focus:outline-none focus:ring-4 focus:ring-purple-300/40">
            <span className="sr-only">Open menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 grid gap-3">
              <Link onClick={() => setMenuOpen(false)} href="#features" className="text-slate-700">Features</Link>
              <Link onClick={() => setMenuOpen(false)} href="#testimonials" className="text-slate-700">Testimonials</Link>
              <Link onClick={() => setMenuOpen(false)} href="#pricing" className="text-slate-700">Pricing</Link>
              <div className="flex gap-3 pt-1">
                <Link href={isLoggedIn ? '/portal/dashboard' : '/login'} className="flex-1 text-center text-slate-700 border border-slate-300 rounded-full px-4 py-2">Sign In</Link>
                <Link href={isLoggedIn ? '/portal/dashboard' : '/login'} className="flex-1 text-center bg-purple-700 text-white rounded-full px-4 py-2">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="px-4 md:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}>
            <svg className="mr-1.5 h-3.5 w-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            Trusted by 2+ users
          </div>
          <h1 className={`mt-5 text-4xl md:text-6xl font-bold leading-tight tracking-tight ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700 delay-100`}>
            Manage Your <span className="text-purple-700">Inventory</span> with Ease
          </h1>
          <p className={`mt-4 text-lg text-slate-600 max-w-3xl mx-auto ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700 delay-150`}>
            Track stock in real‑time, create GST invoices, print barcode labels and understand sales — ApniDukaan is the complete inventory system for Indian retailers.
          </p>
          <div className={`mt-7 flex flex-col sm:flex-row gap-3 justify-center ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700 delay-200`}>
            <Link href={isLoggedIn ? '/portal/dashboard' : '/login'} className="px-6 py-3 rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition inline-flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-purple-400/50">
              <Zap className="h-4 w-4 mr-2" />
              Start Managing Free
            </Link>
            <Link href={isLoggedIn ? '/portal/dashboard' : '/login'} className="px-6 py-3 rounded-full border border-slate-300 text-slate-800 font-medium hover:bg-white transition inline-flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-purple-300/40">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: PackageCheck, title: 'Real-time Tracking', desc: 'Always know what’s in stock with instant updates and low‑stock alerts.' },
            { icon: Shield, title: 'Secure & Reliable', desc: 'Encrypted data, role-based access and daily backups keep you safe.' },
            { icon: BarChart4, title: 'Multi-Cart System', desc: 'Bill faster with parallel carts and quick barcode scanning.' }
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur p-6 transition shadow-none hover:shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-xl bg-purple-700/10 text-purple-700 flex items-center justify-center">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="ml-4 text-lg font-semibold">{f.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="px-4 md:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { quote: 'ApniDukaan made our billing smooth and stock accurate from day one.', name: 'Rahul S.', company: 'Shree Traders' },
            { quote: 'The barcode labels and quick invoicing saved us hours every week.', name: 'Priya K.', company: 'Metro Mart' }
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur p-6">
              <div className="flex items-center text-yellow-500 mb-2">
                {[...Array(5)].map((_, s) => (<svg key={s} className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>))}
              </div>
              <p className="text-slate-800">“{t.quote}”</p>
              <div className="mt-3 text-sm text-slate-600">{t.name} • {t.company}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-lg p-10 md:p-14 shadow-md">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Ready to grow your business?</h2>
          <p className="mt-2 text-slate-600">Start your free trial and see how ApniDukaan simplifies everyday operations.</p>
          <Link href={isLoggedIn ? '/portal/dashboard' : '/login'} className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition focus:outline-none focus:ring-4 focus:ring-purple-400/50">
            Start Your Free Trial
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </section>

      <footer className="px-4 md:px-6 lg:px-8 py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-semibold">A</div>
              <span className="ml-2 text-base font-semibold">ApniDukaan</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">The complete inventory management system for Indian retailers.</p>
          </div>
          <div>
            <div className="text-sm font-semibold">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-slate-900">Features</a></li>
              <li><a href="#pricing" className="hover:text-slate-900">Pricing</a></li>
              <li><a href="#testimonials" className="hover:text-slate-900">Testimonials</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">About</a></li>
              <li><a href="#" className="hover:text-slate-900">Careers</a></li>
              <li><a href="#" className="hover:text-slate-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Support</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">Help Center</a></li>
              <li><a href="#" className="hover:text-slate-900">Documentation</a></li>
              <li><a href="#" className="hover:text-slate-900">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">© 2025 ApniDukaan. All rights reserved.</div>
      </footer>
      <style jsx>{`
        @keyframes slowFloat {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0, -12px, 0) scale(1.05); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;