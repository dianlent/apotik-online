'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users, 
    Barcode,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronDown,
    ChevronRight,
    FileText,
    TrendingUp,
    Truck,
    Tag,
    ClipboardList
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSettings } from '@/context/SettingsContext'

interface AdminLayoutProps {
    children: React.ReactNode
}

interface MenuItem {
    name: string
    href: string
    icon: any
    submenu?: MenuItem[]
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Products'])
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { generalSettings } = useSettings()

    useEffect(() => {
        setMounted(true)
    }, [])

    const menuItems: MenuItem[] = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard
        },
        {
            name: 'POS',
            href: '/kasir',
            icon: ShoppingCart
        },
        {
            name: 'Products',
            href: '/admin/products',
            icon: Package,
            submenu: [
                { name: 'All Products', href: '/admin/products', icon: Package },
                { name: 'Inventory', href: '/admin/inventory', icon: Barcode },
                { name: 'Stock Opname', href: '/admin/stock-opname', icon: ClipboardList },
                { name: 'Categories', href: '/admin/categories', icon: Tag }
            ]
        },
        {
            name: 'Orders',
            href: '/admin/orders',
            icon: ShoppingCart
        },
        {
            name: 'Personnel',
            href: '/admin/users',
            icon: Users
        },
        {
            name: 'Vendors',
            href: '/admin/vendors',
            icon: Truck
        },
        {
            name: 'Reports',
            href: '/admin/reports',
            icon: TrendingUp
        },
        {
            name: 'Delivery',
            href: '/admin/delivery',
            icon: Truck
        },
        {
            name: 'Configurations',
            href: '#',
            icon: Settings,
            submenu: [
                { name: 'General Settings', href: '/admin/settings/general', icon: Settings },
                { name: 'Orders', href: '/admin/settings/orders', icon: ShoppingCart },
                { name: 'Products', href: '/admin/settings/products', icon: Package }
            ]
        }
    ]

    const toggleMenu = (menuName: string) => {
        setExpandedMenus(prev => 
            prev.includes(menuName) 
                ? prev.filter(m => m !== menuName)
                : [...prev, menuName]
        )
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`${
                sidebarOpen ? 'w-64' : 'w-20'
            } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col fixed h-full z-30`}>
                {/* Logo */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    {sidebarOpen ? (
                        <>
                            <div className="flex items-center">
                                {generalSettings?.storeLogo ? (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white p-1">
                                        <img 
                                            src={generalSettings.storeLogo} 
                                            alt={generalSettings.storeName || 'Logo'} 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-gray-900">
                                        {(generalSettings?.storeName || 'A').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="ml-3">
                                    <h1 className="font-bold text-lg">{generalSettings?.storeName || 'APOTIK POS'}</h1>
                                    <p className="text-xs text-gray-400">Admin Panel</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 hover:bg-gray-700 rounded"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-1 hover:bg-gray-700 rounded mx-auto"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                {item.submenu ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.name)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                                                isActive(item.href)
                                                    ? 'bg-yellow-500 text-gray-900'
                                                    : 'hover:bg-gray-700 text-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <item.icon className="h-5 w-5" />
                                                {sidebarOpen && (
                                                    <span className="ml-3 font-medium">{item.name}</span>
                                                )}
                                            </div>
                                            {sidebarOpen && (
                                                expandedMenus.includes(item.name) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )
                                            )}
                                        </button>
                                        {sidebarOpen && expandedMenus.includes(item.name) && (
                                            <ul className="mt-1 ml-4 space-y-1">
                                                {item.submenu.map((subitem) => (
                                                    <li key={subitem.name}>
                                                        <Link
                                                            href={subitem.href}
                                                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                                                                isActive(subitem.href)
                                                                    ? 'bg-yellow-500 text-gray-900'
                                                                    : 'hover:bg-gray-700 text-gray-400'
                                                            }`}
                                                        >
                                                            <subitem.icon className="h-4 w-4" />
                                                            <span className="ml-3">{subitem.name}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                                            isActive(item.href)
                                                ? 'bg-yellow-500 text-gray-900'
                                                : 'hover:bg-gray-700 text-gray-300'
                                        }`}
                                        title={!sidebarOpen ? item.name : ''}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {sidebarOpen && (
                                            <span className="ml-3 font-medium">{item.name}</span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-red-600 transition-colors text-gray-300"
                        title={!sidebarOpen ? 'Logout' : ''}
                    >
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-gray-100 rounded-lg mr-4"
                            >
                                <Menu className="h-5 w-5 text-gray-600" />
                            </button>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {menuItems.find(item => isActive(item.href))?.name || 'Dashboard'}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.push('/admin/settings/general')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Settings"
                            >
                                <Settings className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
