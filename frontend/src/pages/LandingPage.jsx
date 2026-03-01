import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <Hero />
      <TrustBar />
      <FeatureWorkflows />
      <FeatureCompliance />
      <FAQ />
      <DarkCTA />
      <Footer />
    </div>
  )
}

function Logo({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className={`w-7 h-7 ${dark ? 'bg-white' : 'bg-black'} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <span className={`${dark ? 'text-black' : 'text-white'} font-black text-base leading-none`}>✳</span>
      </div>
      <span className={`font-bold text-lg tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>VaultFlow</span>
    </Link>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <Logo />
        <nav className="hidden md:flex items-center gap-7">
          {[['Features', '#features'], ['Customers', '#'], ['Pricing', '#pricing']].map(([label, href]) => (
            <a key={label} href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 transition-colors">Sign in</Link>
          <Link to="/register" className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Get Started</Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const [email, setEmail] = useState('')
  return (
    <section className="pt-20 pb-0 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto text-center">
        <motion.a href="#features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-500 text-sm px-4 py-1.5 rounded-full mb-8 hover:bg-gray-50 transition-colors">
          Now with AI-powered document review <ArrowRight size={12} />
        </motion.a>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.08] tracking-tight mb-5">
          Secure document workflows<br />for ambitious teams
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-gray-500 max-w-xl mx-auto mb-7 leading-relaxed">
          Built for fast-growing companies. Smart workflows handle approvals, compliance, and
          audit trails so your team doesn't have to.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="flex items-center justify-center gap-2 mb-8">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-semibold text-gray-700">5/5</span>
          <span className="text-sm text-gray-400">Hear from our customers</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-2 max-w-md mx-auto">
          <input type="email" placeholder="What's your work email?" value={email} onChange={e => setEmail(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors bg-white" />
          <Link to={email ? `/register?email=${encodeURIComponent(email)}` : '/register'}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-3 rounded-lg transition-colors whitespace-nowrap">
            → Get Started
          </Link>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
        className="max-w-5xl mx-auto mt-14">
        <div className="bg-[#1c1c1e] rounded-t-2xl p-3 shadow-2xl">
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
          </div>
          <DashboardMockup />
        </div>
      </motion.div>
    </section>
  )
}

function DashboardMockup() {
  return (
    <div className="bg-white rounded-lg overflow-hidden flex" style={{ height: 340 }}>
      <div className="w-44 bg-gray-50 border-r border-gray-100 p-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 mb-4 px-1">
          <div className="w-4 h-4 bg-black rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[8px] font-black">✳</span>
          </div>
          <span className="text-xs font-semibold text-gray-700 truncate">Acme Corp</span>
        </div>
        {[['Home', false], ['Documents', true], ['Pending Review', false], ['Team', false], ['Settings', false]].map(([label, active]) => (
          <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs mb-0.5 ${active ? 'bg-black text-white' : 'text-gray-500'}`}>
            <div className={`w-1 h-1 rounded-full ${active ? 'bg-white' : 'bg-gray-300'}`} />
            {label}
          </div>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <p className="text-sm font-semibold text-gray-800 mb-3">Good morning, Sarah</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[['Total Docs', '142', 'bg-gray-50'], ['Pending', '8', 'bg-amber-50'], ['Approved', '126', 'bg-green-50']].map(([label, val, bg]) => (
            <div key={label} className={`${bg} rounded-lg p-2.5`}>
              <p className="text-[10px] text-gray-400">{label}</p>
              <p className="text-base font-bold text-gray-800">{val}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {[
            ['Q4 Financial Report.pdf', 'Approved', 'text-green-600 bg-green-50'],
            ['Employment Contract — J. Miller', 'Pending', 'text-amber-600 bg-amber-50'],
            ['NDA Template v3.docx', 'Approved', 'text-green-600 bg-green-50'],
            ['Vendor Agreement 2026', 'Draft', 'text-gray-500 bg-gray-100'],
          ].map(([name, status, cls]) => (
            <div key={name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-[11px] text-gray-700 truncate flex-1 mr-2">{name}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls} flex-shrink-0`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-36 border-l border-gray-100 p-3 flex-shrink-0">
        <div className="bg-green-50 rounded-lg p-2.5 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[7px] font-bold">✓</span>
            </div>
            <span className="text-[10px] font-semibold text-green-700">All Compliant</span>
          </div>
          <p className="text-[9px] text-green-600">Audit trail up to date</p>
        </div>
        <p className="text-[10px] text-gray-400 mb-1.5">Recent activity</p>
        {['Doc approved', 'User invited', 'Doc uploaded', 'Doc rejected'].map(a => (
          <div key={a} className="text-[10px] text-gray-600 py-1.5 border-b border-gray-50 last:border-0">{a}</div>
        ))}
      </div>
    </div>
  )
}

function TrustBar() {
  return (
    <div className="py-12 px-6 border-y border-gray-100 mt-12">
      <p className="text-center text-sm text-gray-400 mb-7">Trusted by finance and ops teams at fast-growing companies</p>
      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-8">
        {['Stripe', 'Notion', 'Linear', 'Vercel', 'Loom', 'Figma', 'Rippling'].map(l => (
          <span key={l} className="text-gray-300 font-bold text-sm tracking-widest uppercase">{l}</span>
        ))}
      </div>
    </div>
  )
}

function FeatureWorkflows() {
  return (
    <section id="features" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="text-brand-600 text-sm font-semibold">Workflows</span>
          <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4 leading-tight">Approve documents<br />without lifting a finger</h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Submit once, track always. VaultFlow automatically routes documents through your
            approval chain — from DRAFT to APPROVED in minutes. Every action is logged with a timestamp and actor.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="space-y-1">
            {[
              ['📄', 'Employee uploads document', 'Draft', 'bg-blue-50 text-blue-600'],
              ['🔄', 'Submitted for manager review', 'Pending', 'bg-amber-50 text-amber-600'],
              ['✅', 'Manager approves', 'Approved', 'bg-green-50 text-green-600'],
            ].map(([icon, label, status, cls], i, arr) => (
              <div key={label}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cls} flex items-center justify-center text-lg flex-shrink-0`}>{icon}</div>
                  <p className="text-sm font-medium text-gray-800 flex-1">{label}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{status}</span>
                </div>
                {i < arr.length - 1 && <div className="ml-5 my-1 w-0.5 h-4 bg-gray-100 rounded-full" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCompliance() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="bg-gray-50 rounded-2xl border border-gray-100 p-6 order-2 lg:order-1">
          {[
            ['🔒', 'Role-based access control', 'ADMIN · MANAGER · EMPLOYEE'],
            ['📋', 'Full immutable audit trail', 'Every action timestamped & logged'],
            ['🏢', 'Multi-tenant isolation', 'Separate workspace per company'],
            ['☁️', 'S3 secure file storage', 'Cloud document storage built-in'],
          ].map(([icon, label, desc]) => (
            <div key={label} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3 last:mb-0">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 text-[10px] font-bold">✓</span>
              </div>
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="order-1 lg:order-2">
          <span className="text-brand-600 text-sm font-semibold">Compliance</span>
          <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4 leading-tight">Stay compliant<br />across every team</h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Enterprise-grade security with role-based access controls. Every document change,
            approval, and rejection is immutably logged — giving you a complete audit trail
            for any compliance review, any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

const FAQ_ITEMS = [
  { q: 'How is VaultFlow different from other platforms?', a: 'VaultFlow is purpose-built for multi-tenant document workflows with role-based access control, full audit trails, and an approval engine — not a generic file storage solution.' },
  { q: 'Who is VaultFlow built for?', a: 'Fast-growing companies from 10 to 500+ employees who need structured document approval workflows with compliance and audit requirements.' },
  { q: 'How long does it take to get started?', a: 'Setup takes under 10 minutes. Create your workspace, invite your team, and start routing documents for approval immediately.' },
  { q: 'Does VaultFlow handle role-based access control?', a: 'Yes. VaultFlow enforces ADMIN, MANAGER, and EMPLOYEE roles at every level — from who can upload to who can approve or reject.' },
  { q: 'Can VaultFlow integrate with our existing tools?', a: 'VaultFlow offers a REST API and webhook support, making it easy to connect with Slack, Notion, and other tools your team already uses.' },
  { q: 'What kind of support does VaultFlow offer?', a: 'We offer email support for all plans and dedicated onboarding assistance for larger teams.' },
  { q: 'What does VaultFlow cost?', a: 'VaultFlow offers a free tier for small teams. Contact us for pricing on larger plans with advanced compliance features.' },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section id="faq" className="py-24 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div>
          <h2 className="text-4xl font-black text-gray-900">Questions?</h2>
        </div>
        <div className="lg:col-span-2 divide-y divide-gray-100">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`py-4 cursor-pointer transition-all rounded-lg ${open === i ? 'bg-gray-50 px-4 -mx-4' : ''}`}
              onClick={() => setOpen(open === i ? null : i)}>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-800">{item.q}</span>
                <span className="text-gray-400 text-lg flex-shrink-0">{open === i ? '−' : '+'}</span>
              </div>
              {open === i && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const RINGS = [
  { size: 200, top: '-60px',  left: '-60px',   type: 'geo-ring' },
  { size: 340, top: '-120px', left: '-120px',  type: 'geo-ring-rev' },
  { size: 480, top: '-180px', left: '-180px',  type: 'geo-ring-dash' },
  { size: 160, top: '30%',   right: '-60px',  type: 'geo-ring' },
  { size: 280, top: '20%',   right: '-110px', type: 'geo-ring-rev' },
  { size: 400, top: '10%',   right: '-170px', type: 'geo-ring-dash' },
  { size: 240, top: '55%',   left: '38%',     type: 'geo-ring-rev' },
  { size: 120, top: '70%',   left: '55%',     type: 'geo-ring' },
]

const DOTS = [
  { top: '15%', left: '12%',  delay: '0s',   dur: '2.4s' },
  { top: '28%', left: '78%',  delay: '0.8s', dur: '3.1s' },
  { top: '60%', left: '22%',  delay: '1.4s', dur: '2.7s' },
  { top: '72%', left: '65%',  delay: '0.3s', dur: '2.0s' },
  { top: '40%', left: '90%',  delay: '1.9s', dur: '3.5s' },
  { top: '85%', left: '42%',  delay: '0.6s', dur: '2.2s' },
  { top: '20%', left: '50%',  delay: '2.2s', dur: '2.8s' },
  { top: '50%', left: '5%',   delay: '1.1s', dur: '3.0s' },
  { top: '90%', left: '80%',  delay: '0.4s', dur: '2.5s' },
  { top: '8%',  left: '35%',  delay: '1.6s', dur: '1.9s' },
]

const STARS = [
  { left: '5%',  top: '60%', len: 120, delay: '0s',   dur: '3.2s' },
  { left: '15%', top: '75%', len: 90,  delay: '1.1s', dur: '2.8s' },
  { left: '28%', top: '55%', len: 150, delay: '0.4s', dur: '3.6s' },
  { left: '38%', top: '80%', len: 80,  delay: '2.0s', dur: '2.5s' },
  { left: '50%', top: '65%', len: 110, delay: '0.9s', dur: '3.0s' },
  { left: '60%', top: '50%', len: 140, delay: '1.7s', dur: '3.4s' },
  { left: '70%', top: '72%', len: 95,  delay: '0.2s', dur: '2.9s' },
  { left: '80%', top: '58%', len: 130, delay: '1.4s', dur: '3.1s' },
  { left: '88%', top: '78%', len: 75,  delay: '2.5s', dur: '2.6s' },
  { left: '3%',  top: '85%', len: 160, delay: '0.7s', dur: '3.8s' },
  { left: '45%', top: '88%', len: 100, delay: '1.9s', dur: '2.7s' },
  { left: '92%', top: '62%', len: 115, delay: '3.1s', dur: '3.3s' },
]

function DarkCTA() {
  return (
    <section className="relative bg-[#0a0a0a] py-28 px-6 overflow-hidden">

      {/* Animated rings */}
      {RINGS.map((r, i) => (
        <div
          key={i}
          className={r.type}
          style={{
            width:  r.size,
            height: r.size,
            top:    r.top,
            left:   r.left  ?? 'auto',
            right:  r.right ?? 'auto',
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}

      {/* Twinkling dots */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="twinkle-dot"
          style={{ top: d.top, left: d.left, animationDuration: d.dur, animationDelay: d.delay }}
        />
      ))}

      {/* Shooting stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="shooting-star"
          style={{ left: s.left, top: s.top, width: s.len, animationDuration: s.dur, animationDelay: s.delay }}
        />
      ))}

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-8 leading-tight">
          Ready to streamline<br />your document workflows?
        </h2>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/register" className="bg-white text-black hover:bg-gray-100 font-medium text-sm px-7 py-3 rounded-lg transition-colors">Get Started</Link>
          <Link to="/login" className="border border-gray-600 text-white hover:border-gray-400 font-medium text-sm px-7 py-3 rounded-lg transition-colors">Sign in</Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const cols = [
    { title: 'Products', links: ['Documents', 'Workflows', 'Compliance', 'Team Management'] },
    { title: 'Resources', links: ['Pricing', 'Documentation', 'Blog', 'Support Status'] },
    { title: 'Company', links: ['About', 'Careers', 'Contact'] },
    { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Security'] },
  ]
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 px-6 pt-14 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Logo dark />
            <p className="text-xs text-gray-500 leading-relaxed mt-3">Secure document workflows for ambitious teams.</p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-gray-600 text-xs">© 2026 VaultFlow. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/login" className="text-gray-600 text-xs hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="text-gray-600 text-xs hover:text-white transition-colors">Get started</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
