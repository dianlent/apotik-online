'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types'

export default function AuthGuard({ 
    children, 
    allowedRoles = [] 
}: { 
    children: React.ReactNode
    allowedRoles?: UserRole[] 
}) {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Check user role from profiles table
            if (allowedRoles.length > 0) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
                    router.push('/')
                    return
                }
            }

            setAuthorized(true)
            setLoading(false)
        }
        checkAuth()
    }, [router, supabase, allowedRoles])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!authorized) {
        return null
    }

    return <>{children}</>
}
