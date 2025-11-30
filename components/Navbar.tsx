'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/types'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { items } = useCart()
    const [isAnimating, setIsAnimating] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (items.length > 0) {
            setIsAnimating(true)
            const timer = setTimeout(() => setIsAnimating(false), 300)
            return () => clearTimeout(timer)
        }
    }, [items.length])

    useEffect(() => {
        checkUser()
    }, [])

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile) {
                setUserRole(profile.role as UserRole)
            }
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        setUser(null)
        setUserRole(null)
        router.push('/')
        router.refresh()
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    const getDashboardLink = () => {
        if (userRole === 'admin') return '/admin'
        if (userRole === 'kasir') return '/kasir'
        if (userRole === 'customer') return '/member'
        return null
    }

    return (
        <nav className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-200">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                                <span className="relative flex h-2 w-2 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Buka 24/7
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">✓ Obat Original & Terjamin</span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline">🚀 Pengiriman Cepat</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <a href="tel:+6281234567890" className="hover:text-blue-200 transition-colors">
                                📞 +62 812-3456-7890
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                                    <span className="text-white font-bold text-xl">A</span>
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Apotik POS
                                </span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-blue-600 inline-flex items-center px-4 py-2 text-sm font-medium transition-all rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 relative group"
                            >
                                <span className="relative z-10">Home</span>
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link
                                href="/products"
                                className="text-gray-700 hover:text-blue-600 inline-flex items-center px-4 py-2 text-sm font-medium transition-all rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 relative group"
                            >
                                <span className="relative z-10">Products</span>
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                        {getDashboardLink() && (
                            <Link 
                                href={getDashboardLink()!} 
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <LayoutDashboard className="h-5 w-5 mr-2" />
                                Dashboard
                            </Link>
                        )}
                        <Link href="/cart" className={`relative p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-all ${isAnimating ? 'animate-bounce' : ''}`}>
                            <span className="sr-only">View cart</span>
                            <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        {user ? (
                            <button 
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all shadow-sm hover:shadow-md"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                Logout
                            </button>
                        ) : (
                            <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md">
                                <User className="h-5 w-5 mr-2" />
                                Login
                            </Link>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className="bg-white inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="sm:hidden border-t border-gray-100" id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        <Link
                            href="/"
                            className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors"
                        >
                            Products
                        </Link>
                        {getDashboardLink() && (
                            <Link
                                href={getDashboardLink()!}
                                className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                        <Link
                            href="/cart"
                            className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors"
                        >
                            Cart
                        </Link>
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
