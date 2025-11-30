'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, Package, LogOut, Menu, X, ShoppingCart, Receipt } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface MemberLayoutProps {
    children: React.ReactNode
}

export default function MemberLayout({ children }: MemberLayoutProps) {
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userName, setUserName] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()
    const { showToast } = useToast()

    useEffect(() => {
        checkAuth()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function checkAuth() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                showToast('Silakan login terlebih dahulu', 'error')
                router.push('/login')
                return
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', user.id)
                .single()

            if (!profile) {
                showToast('Profile tidak ditemukan', 'error')
                router.push('/login')
                return
            }

            // Check if user is customer/member
            if (profile.role !== 'customer') {
                showToast('Halaman ini khusus untuk member', 'error')
                router.push('/')
                return
            }

            setUserName(profile.full_name || '')
            setUserEmail(user.email || '')
        } catch (error) {
            console.error('Error checking auth:', error)
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        try {
            await supabase.auth.signOut()
            showToast('Berhasil logout', 'success')
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
            showToast('Gagal logout', 'error')
        }
    }

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/member',
            icon: ShoppingCart,
            active: pathname === '/member'
        },
        {
            name: 'Edit Profile',
            href: '/member/profile',
            icon: User,
            active: pathname === '/member/profile'
        },
        {
            name: 'Transaksi',
            href: '/member/transactions',
            icon: Receipt,
            active: pathname === '/member/transactions'
        }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header - Mobile */}
            <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {sidebarOpen ? (
                                <X className="h-6 w-6 text-gray-700" />
                            ) : (
                                <Menu className="h-6 w-6 text-gray-700" />
                            )}
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Member</h1>
                            <p className="text-xs text-gray-600">{userName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar - Desktop & Mobile */}
                <aside
                    className={`
                        fixed lg:sticky top-0 left-0 z-30
                        h-screen w-64 bg-white border-r border-gray-200 shadow-lg
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        lg:translate-x-0
                    `}
                >
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">Member</h2>
                                    <p className="text-xs text-blue-100">Dashboard</p>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {userName.charAt(0).toUpperCase() || 'M'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{userName}</p>
                                    <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                                                ${item.active
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                                }
                                            `}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </nav>

                        {/* Logout Button - Desktop */}
                        <div className="hidden lg:block p-4 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
