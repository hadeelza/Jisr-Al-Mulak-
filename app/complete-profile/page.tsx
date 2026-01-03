'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabaseClient'
import { fetchUserProfile, upsertProfile, isProfileComplete } from '@/src/lib/profileHelpers'
import type { User } from '@supabase/supabase-js'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const [validationErrors, setValidationErrors] = useState<{
    username?: string
    full_name?: string
    phone?: string
  }>({})

  useEffect(() => {
    checkUserAndProfile()
  }, [])

  const checkUserAndProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      const profile = await fetchUserProfile(user.id)
      if (profile && isProfileComplete(profile)) {
        router.push('/profile')
        return
      }

      if (profile) {
        setUsername(profile.username || '')
        setFullName(profile.full_name || '')
        setPhone(profile.phone || '')
      }
    } catch (err) {
      console.error('Error checking user:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {}

    if (!username.trim()) {
      errors.username = 'اسم المستخدم مطلوب'
    } else if (username.trim().length < 3) {
      errors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
    }

    if (!fullName.trim()) {
      errors.full_name = 'الاسم الكامل مطلوب'
    } else if (fullName.trim().length < 2) {
      errors.full_name = 'الاسم الكامل يجب أن يكون حرفين على الأقل'
    }

    if (!phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب'
    } else if (!/^05\d{8}$/.test(phone.trim())) {
      errors.phone = 'رقم الهاتف يجب أن يكون بصيغة صحيحة (05xxxxxxxx)'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    setSaving(true)

    try {
      const result = await upsertProfile(user.id, {
        username: username.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: user.email || undefined,
      })

      if (result.success) {
        router.push('/profile')
        router.refresh()
      } else {
        setError(result.error || 'حدث خطأ أثناء حفظ البيانات')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-right">
            إكمال الملف الشخصي
          </h1>
          <p className="text-gray-600 mb-6 text-right">
            يرجى إكمال معلوماتك الشخصية للمتابعة
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (validationErrors.username) {
                    setValidationErrors(prev => ({ ...prev, username: undefined }))
                  }
                }}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right transition-colors text-black ${
                  validationErrors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="اسم المستخدم"
                dir="ltr"
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600 text-right">{validationErrors.username}</p>
              )}
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
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (validationErrors.full_name) {
                    setValidationErrors(prev => ({ ...prev, full_name: undefined }))
                  }
                }}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right transition-colors text-black ${
                  validationErrors.full_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="الاسم الكامل"
                dir="rtl"
              />
              {validationErrors.full_name && (
                <p className="mt-1 text-sm text-red-600 text-right">{validationErrors.full_name}</p>
              )}
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
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (validationErrors.phone) {
                    setValidationErrors(prev => ({ ...prev, phone: undefined }))
                  }
                }}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right transition-colors text-black ${
                  validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600 text-right">{validationErrors.phone}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-800 text-right">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ والمتابعة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

