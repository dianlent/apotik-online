'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, Eye } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalUsers: 0,
        todayOrders: 0,
        todayRevenue: 0
    })
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAuth()
        loadStats()
    }, [])

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            router.push('/')
        }
    }

    async function loadStats() {
        try {
            // Get today's date range
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            // Get all orders
            const { data: allOrders } = await supabase
                .from('orders')
                .select('total, created_at')

            const totalOrders = allOrders?.length || 0
            const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0

            // Get today's orders
            const todayOrders = allOrders?.filter(order => {
                const orderDate = new Date(order.created_at)
                return orderDate >= today && orderDate < tomorrow
            }) || []

            const todayOrdersCount = todayOrders.length
            const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0)

            // Get total products
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            // Get total users
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            setStats({
                totalOrders,
                totalRevenue,
                totalProducts: productsCount || 0,
                totalUsers: usersCount || 0,
                todayOrders: todayOrdersCount,
                todayRevenue
            })
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen">
                <div className="container-responsive">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 pt-4 sm:pt-6">
                        <h1 className="text-responsive-lg font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Kelola sistem POS Apotik Anda</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {loading ? '...' : stats.totalOrders}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        +{stats.todayOrders} hari ini
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-3">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pendapatan</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {loading ? '...' : `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        +Rp {(stats.todayRevenue / 1000).toFixed(0)}K hari ini
                                    </p>
                                </div>
                                <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-3">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Produk</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {loading ? '...' : stats.totalProducts}
                                    </p>
                                </div>
                                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-3">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pengguna</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {loading ? '...' : stats.totalUsers}
                                    </p>
                                </div>
                                <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-6 sm:pb-8">
                        <Link href="/admin/products" className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Kelola Produk</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">Tambah, edit, atau hapus produk</p>
                                </div>
                                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                            </div>
                        </Link>

                        <Link href="/admin/users" className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Kelola Pengguna</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">Lihat dan kelola pengguna sistem</p>
                                </div>
                                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                            </div>
                        </Link>

                        <Link href="/admin/orders" className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Lihat Pesanan</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">Monitor semua transaksi</p>
                                </div>
                                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                            </div>
                        </Link>

                        <Link href="/admin/reports" className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Laporan</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">Lihat laporan penjualan</p>
                                </div>
                                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}
