import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if needed
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Public routes
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // If there's an auth error or no user, and trying to access protected route
  if ((authError || !user) && !isPublicRoute) {
    // Clear any invalid cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in and trying to access login/register
  if (user && isPublicRoute) {
    try {
      // Check profile completeness
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, phone')
        .eq('id', user.id)
        .maybeSingle()

      // If profile table doesn't exist or other error, allow access to complete-profile
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile check error:', profileError)
        // Don't block, let the user proceed
      }

      const isComplete = !!(
        profile &&
        profile.username &&
        profile.username.trim() !== '' &&
        profile.full_name &&
        profile.full_name.trim() !== '' &&
        profile.phone &&
        profile.phone.trim() !== ''
      )

      if (isComplete) {
        return NextResponse.redirect(new URL('/home', request.url))
      } else {
        return NextResponse.redirect(new URL('/complete-profile', request.url))
      }
    } catch (err) {
      // If there's an error checking profile, redirect to complete-profile
      console.error('Error checking profile in middleware:', err)
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }
  }

  // Check profile completeness for protected routes
  if (user && !isPublicRoute && request.nextUrl.pathname !== '/complete-profile') {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, phone')
        .eq('id', user.id)
        .maybeSingle()

      // If profile table doesn't exist, allow access to complete-profile
      if (profileError && profileError.code === 'PGRST116') {
        return NextResponse.redirect(new URL('/complete-profile', request.url))
      }

      // If other error, log but don't block (let the page handle it)
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile check error:', profileError)
      }

      const isComplete = !!(
        profile &&
        profile.username &&
        profile.username.trim() !== '' &&
        profile.full_name &&
        profile.full_name.trim() !== '' &&
        profile.phone &&
        profile.phone.trim() !== ''
      )

      if (!isComplete) {
        return NextResponse.redirect(new URL('/complete-profile', request.url))
      }
    } catch (err) {
      // If there's an error, redirect to complete-profile
      console.error('Error checking profile completeness:', err)
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

