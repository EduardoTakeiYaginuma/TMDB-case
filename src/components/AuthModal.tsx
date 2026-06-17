import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'

type Tab = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  defaultTab?: Tab
  onClose: () => void
}

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (typeof data?.error === 'string') return data.error
    if (data?.error && typeof data.error === 'object') {
      return Object.values(data.error as Record<string, string[]>)
        .flat()
        .join(' ')
    }
  }
  return 'Algo deu errado. Tente novamente.'
}

export default function AuthModal({ isOpen, defaultTab = 'login', onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login, register } = useAuthStore()
  const showToast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab)
      setIsVisible(true)
      setError(null)
      setUsername('')
      setEmail('')
      setPassword('')
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, defaultTab])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  function switchTab(next: Tab) {
    setTab(next)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (tab === 'login') {
        await login({ username, password })
        showToast(`Bem-vindo de volta, ${username}!`)
      } else {
        await register({ username, email, password })
        showToast(`Conta criada! Bem-vindo, ${username}!`)
      }
      onClose()
    } catch (err) {
      setError(extractError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen && !isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4
                  transition-all duration-200 backdrop-blur-sm
                  ${isVisible && isOpen ? 'bg-black/75 opacity-100' : 'bg-black/0 opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`bg-surface-card rounded-2xl w-full max-w-sm shadow-2xl shadow-black/60
                    ring-1 ring-white/5 transition-all duration-200
                    ${isVisible && isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-surface-elevated">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-black bg-gradient-to-r from-brand via-amber-300 to-brand bg-clip-text text-transparent">
              CineRate
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center
                         text-gray-400 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-elevated p-1 rounded-xl">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  tab === t
                    ? 'bg-brand text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Usuário
              </label>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu_usuario"
                required
                minLength={3}
                autoComplete="username"
                className="w-full bg-surface-elevated border border-white/10 rounded-lg px-3 py-2.5
                           text-sm text-white placeholder-gray-600
                           focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/40
                           transition-colors"
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                  autoComplete="email"
                  className="w-full bg-surface-elevated border border-white/10 rounded-lg px-3 py-2.5
                             text-sm text-white placeholder-gray-600
                             focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/40
                             transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                required
                minLength={tab === 'register' ? 6 : 1}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-surface-elevated border border-white/10 rounded-lg px-3 py-2.5
                           text-sm text-white placeholder-gray-600
                           focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/40
                           transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-brand text-black text-sm font-bold rounded-lg
                       hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isSubmitting
              ? tab === 'login' ? 'Entrando…' : 'Criando conta…'
              : tab === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="text-center text-xs text-gray-500">
            {tab === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              type="button"
              onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
              className="text-brand hover:underline font-medium"
            >
              {tab === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
