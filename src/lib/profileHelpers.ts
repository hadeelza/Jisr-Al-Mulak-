import { supabase } from './supabaseClient'

export interface Profile {
  id: string
  email?: string | null
  username: string
  full_name: string
  phone: string
  created_at: string
  updated_at: string
}

/**
 * Check if a profile is complete (all required fields are filled)
 */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  
  return !!(
    profile.username &&
    profile.username.trim() !== '' &&
    profile.full_name &&
    profile.full_name.trim() !== '' &&
    profile.phone &&
    profile.phone.trim() !== ''
  )
}

/**
 * Fetch user profile from database
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching profile:', error)
      return null
    }

    return data as Profile
  } catch (err) {
    console.error('Unexpected error fetching profile:', err)
    return null
  }
}

/**
 * Create or update user profile
 */
export async function upsertProfile(
  userId: string,
  profileData: {
    username: string
    full_name: string
    phone: string
    email?: string
  }
): Promise<{ success: boolean; error?: string; data?: Profile }> {
  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      console.error('Auth error or user mismatch:', authError)
      return { success: false, error: 'User not authenticated. Please log in again.' }
    }

    console.log('Attempting to upsert profile:', {
      userId,
      username: profileData.username.trim(),
      full_name: profileData.full_name.trim(),
      phone: profileData.phone.trim(),
    })

    // First, try to check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError)
      return { 
        success: false, 
        error: checkError.message || 'Failed to check profile. Make sure the profiles table exists.' 
      }
    }

    let result
    if (existingProfile) {
      // Update existing profile
      console.log('Profile exists, updating...')
      result = await supabase
        .from('profiles')
        .update({
          username: profileData.username.trim(),
          full_name: profileData.full_name.trim(),
          phone: profileData.phone.trim(),
          email: profileData.email?.trim() || null,
        })
        .eq('id', userId)
        .select()
        .single()
    } else {
      // Insert new profile
      console.log('Profile does not exist, inserting...')
      result = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: profileData.username.trim(),
          full_name: profileData.full_name.trim(),
          phone: profileData.phone.trim(),
          email: profileData.email?.trim() || null,
        })
        .select()
        .single()
    }

    const { data, error } = result

    if (error) {
      console.error('Error upserting profile:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      })
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'Failed to save profile'
      if (error.code === '23505') {
        errorMessage = 'اسم المستخدم مستخدم بالفعل. يرجى اختيار اسم آخر.'
      } else if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        errorMessage = 'الجدول غير موجود. يرجى تشغيل migration في Supabase Dashboard > SQL Editor.'
      } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = 'ليس لديك صلاحية. تحقق من RLS policies في Supabase.'
      } else if (error.details) {
        errorMessage = error.details
      } else if (error.hint) {
        errorMessage = error.hint
      }
      
      return { success: false, error: errorMessage }
    }

    if (!data) {
      console.error('No data returned from upsert')
      return { success: false, error: 'No data returned from database' }
    }

    console.log('✅ Profile saved successfully:', data)
    return { success: true, data: data as Profile }
  } catch (err) {
    console.error('Unexpected error upserting profile:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    username?: string
    full_name?: string
    phone?: string
  }
): Promise<{ success: boolean; error?: string; data?: Profile }> {
  try {
    const updateData: any = {}
    if (updates.username) updateData.username = updates.username.trim()
    if (updates.full_name) updateData.full_name = updates.full_name.trim()
    if (updates.phone) updateData.phone = updates.phone.trim()

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Profile }
  } catch (err) {
    console.error('Unexpected error updating profile:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

