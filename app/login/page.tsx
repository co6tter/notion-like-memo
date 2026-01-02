'use client'

import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
      } else {
        setChecking(false)
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.replace('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (checking) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-200">
         <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
         <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]} // Email/Password only for MVP
            theme="default"
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
         />
      </div>
    </div>
  )
}
