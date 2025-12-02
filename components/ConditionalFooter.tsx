'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
    const pathname = usePathname()
    
    // Hide footer on admin, kasir, member, and auth pages
    const hideFooter = pathname?.startsWith('/admin') || 
                       pathname?.startsWith('/kasir') ||
                       pathname?.startsWith('/member') ||
                       pathname?.startsWith('/login') ||
                       pathname?.startsWith('/register')
    
    if (hideFooter) {
        return null
    }
    
    return <Footer />
}
