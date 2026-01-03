'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabaseClient'
import { fetchUserProfile, isProfileComplete } from '@/src/lib/profileHelpers'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/src/lib/profileHelpers'
import Link from 'next/link'

export default function InvestorProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
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
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (logoutLoading) return

    setLogoutLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
      router.replace('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
      router.replace('/login')
    } finally {
      setLogoutLoading(false)
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

  const displayName = profile.full_name || profile.username || user?.email?.split('@')[0] || 'مستخدم'

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <aside className="w-64 bg-purple-900 flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-purple-800">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-purple-700 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">الملاك</h1>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/home"
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors text-purple-200 hover:bg-purple-800 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">الرئيسية</span>
            </Link>

            <Link
              href="/profile"
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors bg-purple-800 text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">الحساب الشخصي</span>
            </Link>

            <Link
              href="/investor/explore"
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors text-purple-200 hover:bg-purple-800 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">استكشف</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-purple-800">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-purple-200 hover:bg-purple-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {logoutLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-200 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">جاري الخروج...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">تسجيل الخروج</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      <div className="w-1 bg-purple-400"></div>

      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-6 space-x-reverse">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center relative">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <svg className="absolute inset-0 w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 45 * 0.75} ${2 * Math.PI * 45}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{displayName}</h2>
                <p className="text-gray-600 leading-relaxed">
                  مستثمر مهتم بدعم المشاريع الناشئة ذات التأثير العالي في السوق السعودي.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">المعلومات الشخصية</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">اسم المستخدم</label>
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <span className="text-gray-700">{profile.username}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">الاسم الكامل</label>
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <span className="text-gray-700">{profile.full_name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">البريد الالكتروني</label>
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <span className="text-gray-700">{user?.email || profile.email || ''}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">رقم الهاتف</label>
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/profile"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              تعديل الملف الشخصي
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

