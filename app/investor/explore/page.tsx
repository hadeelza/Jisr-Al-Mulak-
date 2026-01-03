'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabaseClient'
import { fetchUserProfile, isProfileComplete } from '@/src/lib/profileHelpers'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/src/lib/profileHelpers'

export default function InvestorExplorePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
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

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'مستخدم'

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
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Left Sidebar */}
      <aside className="w-64 bg-purple-900 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Logo */}
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

          {/* Navigation */}
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
              className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors bg-purple-800 text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">استكشف</span>
            </button>
          </nav>

          {/* Logout Button */}
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

      {/* Purple Separator */}
      <div className="w-1 bg-purple-400"></div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Arrow */}
            <button
              onClick={() => router.push('/home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="فلترة متقدمة...."
                  onClick={() => setShowFilterModal(true)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right cursor-pointer"
                  dir="rtl"
                  readOnly
                />
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Icons and User Name */}
            <div className="flex items-center space-x-4 space-x-reverse">
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

        {/* Filter Buttons */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3 space-x-reverse flex-wrap gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              تصفح جميع المشاريع
            </button>
            <button
              onClick={() => setActiveFilter('sector')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'sector'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              حسب القطاع
            </button>
            <button
              onClick={() => setActiveFilter('location')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'location'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              حسب المكان
            </button>
            <button
              onClick={() => setActiveFilter('amount')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'amount'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              حسب مبلغ الاستثمار
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex space-x-1 space-x-reverse">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">مشروع المقصف</h4>
              <p className="text-gray-600 mb-4 text-sm">
                هي نظام رقمي يتيح للمدارس وأولياء الأمور مراقبة مشتريات الأبناء من المقصف وتنظيمها.
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">العائد المتوقع:</span> 15,000 ر.س شهريا
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">80% - تشغيل تجريبي</p>
              </div>
              <button 
                onClick={() => router.push('/investor/projects/canteen')}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                تفاصيل ...
              </button>
            </div>

            {/* Project Card 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-400">
              <div className="flex items-start justify-between mb-4">
                <div className="flex space-x-1 space-x-reverse">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">محفظه</h4>
              <p className="text-gray-600 mb-4 text-sm">
                تطبيق رقمي لتعليم الأطفال إدارة المال والمصروفات بطريقة تفاعلية آمنة.
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">العائد المتوقع:</span> 2,000 ر.س شهريا
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">65% - في مرحلة الاختبار</p>
              </div>
              <button 
                onClick={() => router.push('/investor/projects/wallet')}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                تفاصيل ...
              </button>
            </div>

            {/* Project Card 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex space-x-1 space-x-reverse">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">شمسي</h4>
              <p className="text-gray-600 mb-4 text-sm">
                شركة صغيرة لتركيب أنظمة الطاقة الشمسية للمنازل والمزارع في المناطق النائية
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">العائد المتوقع:</span> 6,000 ر.س شهريا
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">75% - تشغيل تجريبي</p>
              </div>
              <button 
                onClick={() => router.push('/investor/projects/solar')}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                تفاصيل ...
              </button>
            </div>

            {/* Project Card 4 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex space-x-1 space-x-reverse">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">محطات</h4>
              <p className="text-gray-600 mb-4 text-sm">
                شركة تنظم محطات توقف سياحية ذكية على الطرق السريعة بمحتوى ثقافي وترفيهي
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">العائد المتوقع:</span> 1,000 ر.س شهريا
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">50% - التصاريح مكتملة</p>
              </div>
              <button 
                onClick={() => router.push('/investor/projects/stations')}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                تفاصيل ...
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Advanced Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 border-4 border-blue-300" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">فلترة متقدمة</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العائد المتوقع</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black">
                    <option>اختر العائد</option>
                    <option>2000 - 5000 ر.س</option>
                    <option>5000 - 10000 ر.س</option>
                    <option>10000+ ر.س</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المخاطرة</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black">
                    <option>اختر مستوى المخاطرة</option>
                    <option>منخفض</option>
                    <option>متوسط</option>
                    <option>عالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">حالة المشروع</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <span className="mr-2 text-gray-700">نشط في السوق</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <span className="mr-2 text-gray-700">تم الإطلاق التجريبي</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <span className="mr-2 text-gray-700">قيد التطوير</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المشروع</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black">
                    <option>اختر المشروع</option>
                    <option>مشروع المقصف</option>
                    <option>محفظه</option>
                    <option>شمسي</option>
                    <option>محطات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ الاستثمار</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black">
                    <option>اختر المبلغ</option>
                    <option>1000 - 5000 ر.س</option>
                    <option>5000 - 10000 ر.س</option>
                    <option>10000+ ر.س</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مكان الاستثمار</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black">
                    <option>اختر المكان</option>
                    <option>الرياض</option>
                    <option>جدة</option>
                    <option>الدمام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">قطاع الاستثمار</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black">
                    <option>اختر القطاع</option>
                    <option>التقنية</option>
                    <option>التعليم</option>
                    <option>الاستدامة</option>
                    <option>السياحة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">مرحلة المشروع</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <span className="mr-2 text-gray-700">قيد الفكرة</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                ابحث
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

