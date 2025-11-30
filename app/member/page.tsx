'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Package, User, LogOut } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function MemberDashboard() {
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    useEffect(() => {
        checkAuth()
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container-responsive py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Dashboard Member</h1>
                                <p className="text-sm text-gray-600">{userName}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-responsive py-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                        Selamat Datang, {userName}! 👋
                    </h2>
                    <p className="text-blue-100 mb-4">
                        Kelola pemesanan obat dan produk kesehatan Anda dengan mudah
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="px-3 py-1 bg-white/20 rounded-full">
                            ✉️ {userEmail}
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full">
                            👤 Member
                        </div>
                    </div>
                </div>

                {/* Menu Cards */}
                <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                    {/* Online Order Card */}
                    <div 
                        onClick={() => router.push('/order')}
                        className="group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                                        <ShoppingCart className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        Pemesanan Online
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Pesan obat dan produk kesehatan secara online dengan mudah dan cepat. 
                                        Pembayaran menggunakan QRIS untuk kemudahan transaksi.
                                    </p>

                                    {/* Features */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Pilih produk yang tersedia</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Keranjang belanja</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Pembayaran QRIS</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Proses cepat & aman</span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg group-hover:from-blue-700 group-hover:to-indigo-700 transition-all shadow-md group-hover:shadow-lg">
                                        <span>Mulai Pemesanan</span>
                                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Accent */}
                        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-3">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Produk Lengkap</h4>
                            <p className="text-sm text-gray-600">Berbagai pilihan obat dan produk kesehatan</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Harga Terjangkau</h4>
                            <p className="text-sm text-gray-600">Harga kompetitif dan transparan</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <div className="inline-flex p-3 bg-purple-100 rounded-full mb-3">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Aman & Terpercaya</h4>
                            <p className="text-sm text-gray-600">Transaksi aman dengan QRIS</p>
                        </div>
                    </div>
                </div>

                {/* Profile & Help Section */}
                <div className="mt-8 max-w-4xl mx-auto space-y-6">
                    {/* Profile Card */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">✏️ Edit Profil</h3>
                                <p className="text-purple-100 mb-4">
                                    Lengkapi profil Anda untuk pengiriman online GRATIS
                                </p>
                                <Link
                                    href="/member/profile"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all shadow-md"
                                >
                                    <User className="h-5 w-5" />
                                    Kelola Profil
                                </Link>
                            </div>
                            <div className="hidden sm:block">
                                <div className="p-4 bg-white/20 rounded-full">
                                    <User className="h-16 w-16" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Butuh Bantuan?</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Jika Anda memiliki pertanyaan atau membutuhkan bantuan, silakan hubungi customer service kami.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="/contact"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Hubungi Kami
                            </a>
                            <a
                                href="/faq"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                FAQ
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
