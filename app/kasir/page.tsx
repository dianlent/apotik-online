'use client'

import AuthGuard from '@/components/AuthGuard'
import POSModule from '@/components/kasir/POSModule'

export default function KasirPage() {
    return (
        <AuthGuard allowedRoles={['kasir', 'admin']}>
            <POSModule />
        </AuthGuard>
    )
}
