'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
    const pathname = usePathname()
    
    // Hide navbar on admin, kasir, and member pages
    const hideNavbar = pathname.startsWith('/admin') || 
                       pathname.startsWith('/kasir') || 
                       pathname.startsWith('/member')
    
    if (hideNavbar) {
        return null
    }
    
    return <Navbar />
}
