import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

// ─── JWT helpers ─────────────────────────────────────────────────────────────
function parseJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64))
    return {
      id:       payload.sub,
      email:    payload.email  ?? '',
      role:     payload.role   ?? 'EMPLOYEE',
      tenantId: payload.tenantId ?? '',
    }
  } catch {
    return {}
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const parsed = parseJwt(token)
      setUser({ token, ...parsed })
    }
    setLoading(false)
  }, [])

  // ── login with email/password ──
  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { accessToken, refreshToken } = res.data.data
    const parsed = parseJwt(accessToken)
    localStorage.setItem('accessToken',  accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser({ token: accessToken, ...parsed })
    return parsed.role
  }, [])

  // ── register ──
  const register = useCallback(async (email, password, companyName) => {
    const res = await authApi.register({ email, password, companyName })
    const { accessToken, refreshToken } = res.data.data
    const parsed = parseJwt(accessToken)
    localStorage.setItem('accessToken',  accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser({ token: accessToken, ...parsed })
    return parsed.role
  }, [])

  // ── loginWithToken (used by OAuth callback) ──
  const loginWithToken = useCallback((token) => {
    const parsed = parseJwt(token)
    localStorage.setItem('accessToken', token)
    setUser({ token, ...parsed })
    return parsed.role
  }, [])

  // ── logout ──
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try { await authApi.logout(refreshToken) } catch (_) {}
    localStorage.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
