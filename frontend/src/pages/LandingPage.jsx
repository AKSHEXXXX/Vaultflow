import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  ArrowRight, Shield, FileText, Users, Zap,
  CheckCircle, Clock, XCircle
} from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">VaultFlow</span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
            Features
          </a>
          <a href="#how" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
            How it works
          </a>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-24 pb-20 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-brand-100">
            <Zap size={13} /> Multi-tenant · Role-based · Audited
          </span>

          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
            Document workflows,
            <br />
            <span className="text-brand-600">done right.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            VaultFlow gives your team a secure, role-based platform to upload, review, and
            approve documents — with a full audit trail on every decision.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-brand-200"
            >
              Start free <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-gray-700 hover:text-gray-900 font-medium px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-sm"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-400">No credit card required · Setup in 60 seconds</p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Shield,
    title: 'Role-based access',
    description: 'ADMIN, MANAGER, and EMPLOYEE roles enforced at every step. Employees upload, managers approve — no exceptions.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: FileText,
    title: 'Full document lifecycle',
    description: 'Track every document from DRAFT → PENDING → APPROVED or REJECTED with timestamps and actor info.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Users,
    title: 'Multi-tenant isolation',
    description: 'Each company gets a completely isolated workspace. Invite your entire team with one click from the admin panel.',
    color: 'bg-green-50 text-green-600',
  },
]

function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Everything your team needs</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Built for companies that take document management seriously.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-base">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: '01', icon: FileText,    color: 'bg-brand-50 text-brand-500',   title: 'Upload & save as Draft',      desc: 'Any team member uploads a file. It sits safely as a DRAFT.' },
  { n: '02', icon: Clock,       color: 'bg-amber-50 text-amber-500',   title: 'Submit for review',            desc: 'Employee submits it — status flips to PENDING, manager is notified.' },
  { n: '03', icon: CheckCircle, color: 'bg-green-50 text-green-500',   title: 'Manager decides',              desc: 'Manager approves or rejects with one click. Status finalised.' },
]

function HowItWorks() {
  return (
    <section id="how" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-gray-900 mb-4">How it works</h2>
          <p className="text-gray-500 text-lg">Three steps to a fully audited document decision.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-0.5 bg-gradient-to-r from-brand-200 to-brand-200 z-0" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center mb-4 ring-4 ring-white`}>
                <s.icon size={22} />
              </div>
              <span className="text-4xl font-black text-gray-100 mb-2">{s.n}</span>
              <h3 className="font-semibold text-gray-900 mb-2 -mt-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto bg-brand-600 rounded-3xl p-12 text-center shadow-xl shadow-brand-200"
      >
        <h2 className="text-3xl font-black text-white mb-3">Start your free workspace</h2>
        <p className="text-brand-200 mb-8 text-base">No credit card required. Up and running in 60 seconds.</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
        >
          Create workspace <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="font-bold text-white">VaultFlow</span>
        </div>
        <p className="text-sm">© 2026 VaultFlow. All rights reserved.</p>
        <div className="flex gap-6 text-sm">
          <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link to="/register" className="hover:text-white transition-colors">Get started</Link>
        </div>
      </div>
    </footer>
  )
}
