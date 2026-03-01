import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

export default function RegisterPage() {
  const { user, loading, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    companyName: '',
    email:       '',
    password:    '',
    confirm:     '',
  })
  const [showPw,  setShowPw]  = useState(false)
  const [error,   setError]   = useState('')
  const [errors,  setErrors]  = useState({})
  const [submitting, setSub]  = useState(false)

  // Already logged in
  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading])

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.companyName.trim()) errs.companyName = 'Company name is required.'
    if (!form.email.trim())        errs.email       = 'Email is required.'
    if (form.password.length < 8)  errs.password    = 'Password must be at least 8 characters.'
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-md shadow-brand-200">
              <span className="text-white font-black text-base">V</span>
            </div>
            <span className="font-black text-gray-900 text-xl">VaultFlow</span>
          </Link>
          <p className="mt-3 text-gray-500 text-sm">Create your company workspace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Company name"
              name="companyName"
              placeholder="Acme Corp"
              value={form.companyName}
              onChange={handleChange}
              error={errors.companyName}
              autoComplete="organization"
            />

            <Input
              label="Work email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              label="Confirm password"
              name="confirm"
              type={showPw ? 'text' : 'password'}
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full mt-2" loading={submitting}>
              Create workspace
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-400">
            By continuing you agree to our Terms of Service.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a workspace?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
