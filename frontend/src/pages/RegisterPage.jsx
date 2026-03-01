import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { user, loading, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm] = useState({
    companyName: '',
    email: params.get('email') || '',
    password: '',
    confirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSub] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.companyName.trim()) errs.companyName = 'Company name is required.'
    if (!form.email.trim())        errs.email       = 'Email is required.'
    if (form.password.length < 8)  errs.password    = 'At least 8 characters.'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setSub(true); setError('')
    try {
      await register(form.email, form.password, form.companyName)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setSub(false)
    }
  }

  const inputCls = (field) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-300 ${
      errors[field] ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
    }`

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-10 bg-gradient-to-br from-sky-500 via-sky-400 to-blue-300 relative overflow-hidden">
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-7 h-7 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm leading-none">✳</span>
            </div>
            <span className="text-white font-bold text-lg">VaultFlow</span>
          </div>

          <h2 className="text-white font-black text-3xl leading-tight mb-3">
            Set up your workspace<br />in 5 minutes.
          </h2>
          <p className="text-white/75 text-sm leading-relaxed mb-10">
            Teams save hours every month by automating document approvals
            and compliance with VaultFlow. Answer a few quick questions and you're in.
          </p>

          {/* Testimonial card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-300 text-sm">★</span>
              ))}
            </div>
            <p className="text-white text-sm leading-relaxed italic mb-5">
              "VaultFlow feels like the first time I used Linear — the realization
              that document approvals can just work. If you never want to think about
              compliance again, use VaultFlow."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Alex Chen</p>
                <p className="text-white/60 text-xs">CTO, Acme Corp</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-xs mb-3">Trusted by fast-growing teams</p>
          <div className="flex flex-wrap gap-4">
            {['Notion', 'Linear', 'Vercel', 'Loom', 'Figma'].map(l => (
              <span key={l} className="text-white/40 text-xs font-semibold tracking-wide">{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-end px-8 py-4 border-b border-gray-100">
          <span className="text-sm text-gray-500">Already have an account?</span>
          <Link to="/login" className="ml-3 text-sm font-medium border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            Sign in
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="h-0.5 bg-gray-100 mx-8">
          <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: '33%' }} />
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Let's get started</h1>
            <p className="text-sm text-gray-400 mb-8">Tell us a bit about yourself and your company</p>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Work email <span className="text-red-400">*</span>
                </label>
                <input name="email" type="email" placeholder="you@company.com"
                  value={form.email} onChange={handleChange} autoComplete="email"
                  className={inputCls('email')} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company name <span className="text-red-400">*</span>
                </label>
                <input name="companyName" placeholder="Your company name"
                  value={form.companyName} onChange={handleChange} autoComplete="organization"
                  className={inputCls('companyName')} />
                {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input name="password" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
                    value={form.password} onChange={handleChange} autoComplete="new-password"
                    className={inputCls('password') + ' pr-10'} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm password <span className="text-red-400">*</span>
                </label>
                <input name="confirm" type={showPw ? 'text' : 'password'} placeholder="Repeat password"
                  value={form.confirm} onChange={handleChange} autoComplete="new-password"
                  className={inputCls('confirm')} />
                {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium text-sm py-3.5 rounded-xl transition-colors disabled:opacity-60 mt-2"
              >
                {submitting ? 'Creating workspace…' : 'Continue →'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-400">
              By continuing you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600 transition-colors">Terms of Service</a>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
