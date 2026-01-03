'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabaseClient'
import { fetchUserProfile, updateProfile, isProfileComplete } from '@/src/lib/profileHelpers'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/src/lib/profileHelpers'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const [validationErrors, setValidationErrors] = useState<{
    username?: string
    full_name?: string
    phone?: string
  }>({})

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      const userProfile = await fetchUserProfile(user.id)

      if (!userProfile || !isProfileComplete(userProfile)) {
        router.push('/complete-profile')
        return
      }

      setProfile(userProfile)
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

  const handleSave = async () => {
    if (!user || !profile) return

    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const result = await updateProfile(user.id, {
        username: username.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
      })

      if (result.success && result.data) {
        setProfile(result.data)
        setSuccess(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(false), 3000)
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

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center relative">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <svg className="absolute inset-0 w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 45 * 0.7} ${2 * Math.PI * 45}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        if (validationErrors.username) {
                          setValidationErrors(prev => ({ ...prev, username: undefined }))
                        }
                      }}
                      className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-400 focus:outline-none focus:border-purple-500 text-black"
                      placeholder="اسم المستخدم"
                      dir="ltr"
                    />
                  ) : (
                    profile.username
                  )}
                </h1>
                <p className="text-gray-700">مرحباً بك في منصة جسر الملاك</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-right">المعلومات الشخصية</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                اسم المستخدم
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      if (validationErrors.username) {
                        setValidationErrors(prev => ({ ...prev, username: undefined }))
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white ${
                      validationErrors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="اسم المستخدم"
                    dir="ltr"
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-red-600 text-right">{validationErrors.username}</p>
                  )}
                </>
              ) : (
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <span className="text-gray-700">{profile.username}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                الاسم الكامل
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (validationErrors.full_name) {
                        setValidationErrors(prev => ({ ...prev, full_name: undefined }))
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white ${
                      validationErrors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="الاسم الكامل"
                    dir="rtl"
                  />
                  {validationErrors.full_name && (
                    <p className="mt-1 text-sm text-red-600 text-right">{validationErrors.full_name}</p>
                  )}
                </>
              ) : (
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <span className="text-gray-700">{profile.full_name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                البريد الالكتروني
              </label>
              <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                <span className="text-gray-700">{user?.email || profile.email || ''}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                رقم الهاتف
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (validationErrors.phone) {
                        setValidationErrors(prev => ({ ...prev, phone: undefined }))
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600 text-right">{validationErrors.phone}</p>
                  )}
                </>
              ) : (
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
            <p className="text-sm text-green-800 text-right">✅ تم حفظ البيانات بنجاح!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800 text-right">{error}</p>
          </div>
        )}

        <div className="flex justify-center">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false)
                  if (profile) {
                    setUsername(profile.username)
                    setFullName(profile.full_name)
                    setPhone(profile.phone)
                  }
                  setValidationErrors({})
                  setError(null)
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors mr-4"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              تعديل
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

