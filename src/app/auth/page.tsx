'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Chrome,
  ArrowRight,
  Building2,
  History
} from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Check for last login method on mount
  useEffect(() => {
    const lastMethod = localStorage.getItem('lastLoginMethod')
    if (lastMethod) {
      setLastLoginMethod(lastMethod)
    }
  }, [])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
              company_name: companyName,
            }
          },
        })
        
        if (error) throw error
        
        // Create user profile in users table
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              company_name: companyName,
              auth_provider: 'email',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (profileError) console.error('Profile creation error:', profileError)
        }
        
        setSuccess('Check your email for confirmation link!')
        setEmail('')
        setPassword('')
        setFullName('')
        setCompanyName('')
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error

        // Save last login method
        localStorage.setItem('lastLoginMethod', 'email')
        
        // Check if user is admin for redirect
        if (data.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', data.user.id)
            .single()
          
          // Update user's last login info
          await supabase
            .from('users')
            .update({
              last_login: new Date().toISOString(),
              last_login_method: 'email'
            })
            .eq('id', data.user.id)
          
          // Redirect based on role
          if (profile?.is_admin) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) throw error
      
      // Save last login method
      localStorage.setItem('lastLoginMethod', 'google')
      
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setSuccess('Password reset link sent to your email!')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-navy-50 to-slate-100">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 to-navy-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Building2 className="w-8 h-8 text-gold-500" />
            <span className="text-2xl font-bold text-white">Veridian Group</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Regulatory Intelligence for Digital Assets
          </h1>
          <p className="text-navy-200 text-lg mb-8">
            Stay compliant across all 50 states with real-time regulatory updates and AI-powered compliance reports.
          </p>
          
          {/* Feature list */}
          <div className="space-y-4">
            {[
              'Real-time regulatory monitoring',
              'State-by-state compliance analysis',
              'AI-powered risk assessment',
              'Enterprise-grade security'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold-500" />
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Testimonial */}
        <div className="bg-white/10 rounded-xl p-6">
          <p className="text-white/90 italic mb-4">
            "Veridian Group has transformed how we handle regulatory compliance. The AI insights are invaluable."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
              <span className="text-navy-900 font-bold">JD</span>
            </div>
            <div>
              <p className="text-white font-medium">Jane Doe</p>
              <p className="text-navy-300 text-sm">Compliance Officer, First Regional Bank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Building2 className="w-6 h-6 text-gold-600" />
            <span className="text-xl font-bold text-navy-900">Veridian Group</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-navy-600">
                {isSignUp 
                  ? 'Start your compliance journey today' 
                  : lastLoginMethod 
                    ? `Last used: ${lastLoginMethod === 'google' ? 'Google' : 'Email'} login` 
                    : 'Sign in to access your dashboard'
                }
              </p>
            </div>

            {/* Last login reminder bubble */}
            {lastLoginMethod && !isSignUp && (
              <div className="mb-6 p-3 bg-navy-50 rounded-lg border border-navy-100 flex items-center gap-2">
                <History className="w-4 h-4 text-navy-500" />
                <span className="text-sm text-navy-600">
                  You last signed in with <span className="font-medium text-navy-900">
                    {lastLoginMethod === 'google' ? 'Google' : 'Email'}
                  </span>
                </span>
              </div>
            )}

            {/* Error/Success messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Google login button */}
            <div className="mb-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Chrome className="w-5 h-5" />
                <span className="font-medium">Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-navy-500">or continue with email</span>
              </div>
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      required={isSignUp}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your Company, Inc."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      required={isSignUp}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-navy-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-navy-400" />
                    )}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                    />
                    <span className="text-sm text-navy-600">Remember me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-900 text-white py-3 rounded-lg font-medium hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle between sign in/up */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setSuccess('')
                }}
                className="text-navy-600 hover:text-navy-800"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : 'Need an account? Sign Up'}
              </button>
            </div>

            {/* Terms */}
            <p className="mt-6 text-xs text-center text-navy-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-gold-600 hover:text-gold-700">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-gold-600 hover:text-gold-700">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}