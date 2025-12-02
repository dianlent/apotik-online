'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Order, OrderStatus } from '@/types'
import { Search, Eye, RefreshCw, X, Package, User, MapPin, Calendar, CreditCard, Plus, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import Link from 'next/link'

interface OrderWithProfile extends Order {
    profiles?: {
        full_name: string | null
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderWithProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderWithProfile | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [orderItems, setOrderItems] = useState<any[]>([])
    const [loadingItems, setLoadingItems] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadOrders()

        // Auto-refresh setiap 30 detik
        const intervalId = setInterval(() => {
            loadOrders(true) // silent refresh
        }, 30000)

        // Realtime subscription untuk update langsung
        const channel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    console.log('Order changed:', payload)
                    loadOrders(true) // silent refresh saat ada perubahan
                }
            )
            .subscribe()

        return () => {
            clearInterval(intervalId)
            supabase.removeChannel(channel)
        }
    }, [])

    async function loadOrders(silent = false) {
        if (!silent) {
            setLoading(true)
        } else {
            setIsRefreshing(true)
        }
        try {
            // Get orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError

            // Get profiles for the user_ids
            const userIds = [...new Set(ordersData?.map(order => order.user_id).filter(Boolean))]
            
            let profilesMap: Record<string, any> = {}
            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', userIds)

                if (!profilesError && profilesData) {
                    profilesMap = profilesData.reduce((acc, profile) => {
                        acc[profile.id] = profile
                        return acc
                    }, {} as Record<string, any>)
                }
            }

            // Combine orders with profiles
            const ordersWithProfiles = ordersData?.map(order => ({
                ...order,
                profiles: order.user_id ? profilesMap[order.user_id] : null
            })) || []

            setOrders(ordersWithProfiles)
            setLastUpdate(new Date())
        } catch (error) {
            console.error('Error loading orders:', error)
            if (!silent) {
                showToast('Gagal memuat pesanan', 'error')
            }
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    function handleManualRefresh() {
        loadOrders()
        showToast('Data pesanan diperbarui', 'success')
    }

    async function handleViewDetail(order: OrderWithProfile) {
        setSelectedOrder(order)
        setShowDetailModal(true)
        setLoadingItems(true)
        
        try {
            // Fetch order items
            const { data, error } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id)
            
            if (error) throw error
            setOrderItems(data || [])
        } catch (error) {
            console.error('Error loading order items:', error)
            showToast('Gagal memuat detail pesanan', 'error')
        } finally {
            setLoadingItems(false)
        }
    }

    function closeDetailModal() {
        setShowDetailModal(false)
        setSelectedOrder(null)
        setOrderItems([])
    }

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error
            showToast('Status pesanan berhasil diupdate', 'success')
            loadOrders()
        } catch (error) {
            console.error('Error updating order status:', error)
            showToast('Gagal mengupdate status pesanan', 'error')
        }
    }

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'paid':
                return 'bg-blue-100 text-blue-800'
            case 'shipped':
                return 'bg-purple-100 text-purple-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return 'Pending'
            case 'paid':
                return 'Dibayar'
            case 'shipped':
                return 'Dikirim'
            case 'completed':
                return 'Selesai'
            case 'cancelled':
                return 'Dibatalkan'
            default:
                return status
        }
    }

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Calculate statistics
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0)
    }

    return (
        <AuthGuard allowedRoles={['admin', 'kasir']}>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Daftar Pesanan</h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <p className="text-gray-600">Monitor semua transaksi</p>
                                    <span className="text-gray-400">•</span>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className={`inline-flex items-center ${isRefreshing ? 'text-blue-600' : ''}`}>
                                            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                                            {isRefreshing ? 'Memperbarui...' : 'Auto-refresh aktif'}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-xs">
                                            Update: {lastUpdate.toLocaleTimeString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/kasir/create-order"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat Order
                                </Link>
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={loading || isRefreshing}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                        {/* Total Orders */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Total Pesanan</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>

                        {/* Pending */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Pending</h3>
                            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                        </div>

                        {/* Paid */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Dibayar</h3>
                            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                        </div>

                        {/* Shipped */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Dikirim</h3>
                            <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
                        </div>

                        {/* Completed */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Selesai</h3>
                            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                        </div>

                        {/* Cancelled */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Dibatalkan</h3>
                            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <h3 className="text-white/90 text-xs font-medium mb-1">Total Pendapatan</h3>
                            <p className="text-xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pesanan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID Pesanan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pelanggan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono text-gray-900">
                                                        {order.id.substring(0, 8)}...
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {order.profiles?.full_name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        Rp {Number(order.total).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Dibayar</option>
                                                        <option value="shipped">Dikirim</option>
                                                        <option value="completed">Selesai</option>
                                                        <option value="cancelled">Dibatalkan</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewDetail(order)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredOrders.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        Tidak ada pesanan ditemukan
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Detail Modal */}
                    {showDetailModal && selectedOrder && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeDetailModal} />
                            
                            <div className="flex min-h-full items-center justify-center p-4">
                                <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                    {/* Header */}
                                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold">Detail Pesanan</h2>
                                                <p className="text-blue-100 text-sm mt-1">
                                                    ID: {selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={closeDetailModal}
                                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            >
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-6">
                                        {/* Customer Info */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <User className="h-5 w-5 text-blue-600" />
                                                <h3 className="font-semibold text-gray-900">Informasi Pelanggan</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-600">Nama</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {selectedOrder.profiles?.full_name || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Tanggal Pesanan</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(selectedOrder.created_at).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Info */}
                                        {selectedOrder.shipping_address && (
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MapPin className="h-5 w-5 text-blue-600" />
                                                    <h3 className="font-semibold text-gray-900">Alamat Pengiriman</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-900">{selectedOrder.shipping_name}</p>
                                                    <p className="text-sm text-gray-700">{selectedOrder.shipping_phone}</p>
                                                    <p className="text-sm text-gray-700">{selectedOrder.shipping_address}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div className="bg-white rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                                                <Package className="h-5 w-5 text-blue-600" />
                                                <h3 className="font-semibold text-gray-900">Produk yang Dipesan</h3>
                                            </div>
                                            <div className="p-4">
                                                {loadingItems ? (
                                                    <div className="text-center py-8">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                        <p className="text-sm text-gray-600 mt-2">Memuat produk...</p>
                                                    </div>
                                                ) : orderItems.length === 0 ? (
                                                    <p className="text-center text-gray-500 py-8">Tidak ada produk</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {orderItems.map((item, index) => (
                                                            <div key={item.id || index} className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100 last:border-0">
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {item.quantity} × Rp {item.price.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    Rp {item.subtotal.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                                <h3 className="font-semibold text-gray-900">Informasi Pembayaran</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal</span>
                                                    <span className="font-medium text-gray-900">
                                                        Rp {(selectedOrder.total - (selectedOrder.shipping_cost || 0)).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Ongkos Kirim</span>
                                                    <span className="font-medium text-gray-900">
                                                        Rp {(selectedOrder.shipping_cost || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-base pt-2 border-t border-green-200">
                                                    <span className="font-semibold text-gray-900">Total</span>
                                                    <span className="font-bold text-green-600 text-lg">
                                                        Rp {selectedOrder.total.toLocaleString()}
                                                    </span>
                                                </div>
                                                {selectedOrder.payment_method && (
                                                    <div className="flex justify-between text-sm pt-2">
                                                        <span className="text-gray-600">Metode Pembayaran</span>
                                                        <span className="font-medium text-gray-900 uppercase">
                                                            {selectedOrder.payment_method}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Status</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                                        {getStatusLabel(selectedOrder.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    )
}
