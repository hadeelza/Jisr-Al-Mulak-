'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabaseClient'
import { fetchUserProfile, isProfileComplete } from '@/src/lib/profileHelpers'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Check if profile is complete
        const profile = await fetchUserProfile(data.user.id)
        const complete = isProfileComplete(profile)

        if (complete) {
          router.push('/home')
        } else {
          router.push('/complete-profile')
        }
        router.refresh()
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      console.error('Login error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-right">
          تسجيل الدخول
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-right transition-colors text-black"
                placeholder="john@email.com"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-right transition-colors text-black"
                placeholder="••••••"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-800 text-right">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{' '}
                <Link
                  href="/register"
                  className="font-medium text-gray-700 hover:text-gray-900 underline"
                >
                  إنشاء حساب
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

