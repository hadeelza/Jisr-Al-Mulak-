'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabaseClient'
import { fetchUserProfile, isProfileComplete } from '@/src/lib/profileHelpers'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/src/lib/profileHelpers'
import Link from 'next/link'

export default function HomePage() {
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
      console.error('Unexpected error:', err)
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

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'مستخدم'

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
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors bg-purple-800 text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">الرئيسية</span>
            </Link>

            <Link
              href="/profile"
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors text-purple-200 hover:bg-purple-800 hover:text-white"
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

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="فلترة متقدمة...."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
                  dir="rtl"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse ml-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="text-gray-900 font-medium">{displayName}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">مرحباً، {displayName}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">المشاريع</h3>
                <p className="text-gray-600">استكشف المشاريع المتاحة</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">الاستثمارات</h3>
                <p className="text-gray-600">تابع استثماراتك</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">الإشعارات</h3>
                <p className="text-gray-600">راجع إشعاراتك</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

