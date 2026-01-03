'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/src/lib/supabaseClient'
import { fetchUserProfile, isProfileComplete } from '@/src/lib/profileHelpers'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/src/lib/profileHelpers'

const projectData: Record<string, any> = {
  canteen: {
    title: 'مشروع المقصف',
    description: 'هي نظام رقمي يتيح للمدارس وأولياء الأمور مراقبة مشتريات الأبناء من المقصف وتنظيمها.',
    expectedReturn: '15,000 ر.س شهريا',
    progress: 80,
    status: 'تشغيل تجريبي',
    sector: 'التعليم',
    location: 'الرياض',
    investmentAmount: '50,000 ر.س',
    risk: 'منخفض',
    stage: 'تشغيل تجريبي'
  },
  wallet: {
    title: 'محفظه',
    description: 'تطبيق رقمي لتعليم الأطفال إدارة المال والمصروفات بطريقة تفاعلية آمنة.',
    expectedReturn: '2,000 ر.س شهريا',
    progress: 65,
    status: 'في مرحلة الاختبار',
    sector: 'التعليم',
    location: 'جدة',
    investmentAmount: '30,000 ر.س',
    risk: 'منخفض',
    stage: 'في مرحلة الاختبار'
  },
  solar: {
    title: 'شمسي',
    description: 'شركة صغيرة لتركيب أنظمة الطاقة الشمسية للمنازل والمزارع في المناطق النائية',
    expectedReturn: '6,000 ر.س شهريا',
    progress: 75,
    status: 'تشغيل تجريبي',
    sector: 'الاستدامة',
    location: 'الدمام',
    investmentAmount: '100,000 ر.س',
    risk: 'متوسط',
    stage: 'تشغيل تجريبي'
  },
  stations: {
    title: 'محطات',
    description: 'شركة تنظم محطات توقف سياحية ذكية على الطرق السريعة بمحتوى ثقافي وترفيهي',
    expectedReturn: '1,000 ر.س شهريا',
    progress: 50,
    status: 'التصاريح مكتملة',
    sector: 'السياحة',
    location: 'الرياض',
    investmentAmount: '200,000 ر.س',
    risk: 'متوسط',
    stage: 'التصاريح مكتملة'
  }
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const project = projectData[slug]

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

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'مستخدم'

  if (loading || !project) {
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
            <button
              onClick={() => router.push('/home')}
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors text-purple-200 hover:bg-purple-800 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">الرئيسية</span>
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors text-purple-200 hover:bg-purple-800 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">الحساب الشخصي</span>
            </button>

            <button
              onClick={() => router.push('/investor/explore')}
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors text-purple-200 hover:bg-purple-800 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">استكشف</span>
            </button>
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

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/investor/explore')}
              className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>رجوع</span>
            </button>
            <div className="text-gray-900 font-medium">{displayName}</div>
          </div>
        </header>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{project.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">تقدم المشروع</span>
                <span className="text-sm text-gray-600">{project.progress}% - {project.status}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">العائد المتوقع</h3>
                <p className="text-xl font-bold text-gray-900">{project.expectedReturn}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">مبلغ الاستثمار</h3>
                <p className="text-xl font-bold text-gray-900">{project.investmentAmount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">القطاع</h3>
                <p className="text-xl font-bold text-gray-900">{project.sector}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">المكان</h3>
                <p className="text-xl font-bold text-gray-900">{project.location}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">المخاطرة</h3>
                <p className="text-xl font-bold text-gray-900">{project.risk}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">المرحلة</h3>
                <p className="text-xl font-bold text-gray-900">{project.stage}</p>
              </div>
            </div>

            <div className="flex space-x-4 space-x-reverse">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                الاستثمار الآن
              </button>
              <button 
                onClick={() => router.push('/investor/explore')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

