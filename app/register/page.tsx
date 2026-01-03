'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabaseClient'
import { upsertProfile, isProfileComplete, fetchUserProfile } from '@/src/lib/profileHelpers'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!username.trim()) {
      setError('اسم المستخدم مطلوب')
      return
    }

    if (!fullName.trim()) {
      setError('الاسم الكامل مطلوب')
      return
    }

    if (!phone.trim()) {
      setError('رقم الهاتف مطلوب')
      return
    }

    if (!/^05\d{8}$/.test(phone.trim())) {
      setError('رقم الهاتف يجب أن يكون بصيغة صحيحة (05xxxxxxxx)')
      return
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    try {
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(`فشل التسجيل: ${signUpError.message}`)
        setLoading(false)
        return
      }

      if (data?.user) {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Verify session is active
        const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser()
        if (sessionError || !currentUser) {
          console.error('Session error after signup:', sessionError)
          setError('تم إنشاء الحساب لكن فشل إنشاء الجلسة. يرجى تسجيل الدخول.')
          setLoading(false)
          return
        }

        // Create profile with all entered data
        const result = await upsertProfile(data.user.id, {
          username: username.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        })

        if (result.success) {
          setSuccess(true)
          
          // Wait a bit for profile to be saved
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Verify profile is complete
          const profile = await fetchUserProfile(data.user.id)
          const complete = isProfileComplete(profile)

          setTimeout(() => {
            if (complete) {
              router.push('/home')
            } else {
              router.push('/complete-profile')
            }
            router.refresh()
          }, 1000)
        } else {
          setError(result.error || 'تم إنشاء الحساب لكن فشل حفظ الملف الشخصي')
          setLoading(false)
        }
      } else {
        setError('اكتمل التسجيل لكن لم يتم إرجاع بيانات المستخدم')
        setLoading(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(`خطأ في التسجيل: ${errorMessage}`)
      console.error('Registration error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-right">
          إنشاء حساب
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                اسم المستخدم *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-right transition-colors text-black"
                placeholder="اسم المستخدم"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                الاسم الكامل *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-right transition-colors text-black"
                placeholder="الاسم الكامل"
                dir="rtl"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                البريد الإلكتروني *
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                رقم الهاتف *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-right transition-colors text-black"
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                كلمة المرور *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-right transition-colors text-black"
                placeholder="••••••"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                تأكيد كلمة المرور *
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {success && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <p className="text-sm text-green-800 text-right mb-2">
                  ✅ تم إنشاء الحساب بنجاح!
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                href="/login"
                className="font-medium text-gray-700 hover:text-gray-900 underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

