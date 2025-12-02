'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Package, ShoppingBag, ShoppingCart, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex flex-col w-64 bg-gray-800">
            <div className="flex items-center justify-center h-16 bg-gray-900">
                <span className="text-white font-bold text-lg">Apotik Admin</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
                <div className="px-2 py-4 border-t border-gray-700">
                    <button
                        onClick={handleSignOut}
                        className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        <LogOut
                            className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300"
                            aria-hidden="true"
                        />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
