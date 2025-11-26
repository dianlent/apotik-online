'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Truck, Package, CheckCircle, Clock, MapPin, Phone, User, Calendar, Search } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface Order {
    id: string
    user_id: string
    total: number
    shipping_cost: number
    status: string
    payment_method: string | null
    payment_status: string | null
    created_at: string
    profiles?: {
        full_name: string
        email?: string
    }
}

interface DeliveryStats {
    pending: number
    inProgress: number
    completed: number
    total: number
}

export default function DeliveryPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [stats, setStats] = useState<DeliveryStats>({
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0
    })
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadOrders()
    }, [])

    useEffect(() => {
        filterOrders()
    }, [orders, searchQuery, statusFilter])

    async function loadOrders() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles (
                        full_name
                    )
                `)
                .in('status', ['paid', 'shipped', 'completed'])
                .order('created_at', { ascending: false })

            if (error) throw error

            setOrders(data || [])

            // Calculate stats
            const pending = data?.filter(o => o.status === 'paid').length || 0
            const inProgress = data?.filter(o => o.status === 'shipped').length || 0
            const completed = data?.filter(o => o.status === 'completed').length || 0

            setStats({
                pending,
                inProgress,
                completed,
                total: data?.length || 0
            })
        } catch (error) {
            console.error('Error loading orders:', error)
            showToast('Gagal memuat pesanan', 'error')
        } finally {
            setLoading(false)
        }
    }

    function filterOrders() {
        let filtered = orders

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredOrders(filtered)
    }

    async function updateOrderStatus(orderId: string, newStatus: string) {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            showToast('Status pesanan berhasil diupdate', 'success')
            loadOrders()
            setShowDetailModal(false)
        } catch (error) {
            console.error('Error updating order status:', error)
            showToast('Gagal mengupdate status', 'error')
        }
    }

    function getStatusBadge(status: string) {
        const badges = {
            paid: { label: 'Menunggu Pengiriman', color: 'bg-yellow-100 text-yellow-800' },
            shipped: { label: 'Dalam Pengiriman', color: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' }
        }
        const badge = badges[status as keyof typeof badges] || { label: status, color: 'bg-gray-100 text-gray-800' }
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.label}
            </span>
        )
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'paid':
                return <Clock className="h-5 w-5 text-yellow-600" />
            case 'shipped':
                return <Truck className="h-5 w-5 text-blue-600" />
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            default:
                return <Package className="h-5 w-5 text-gray-600" />
        }
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pengiriman</h1>
                        <p className="text-gray-600">Kelola status pengiriman pesanan</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Menunggu Pengiriman</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Truck className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Dalam Pengiriman</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Selesai</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Package className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Pesanan</h3>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari ID pesanan atau nama customer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Semua Status</option>
                                <option value="paid">Menunggu Pengiriman</option>
                                <option value="shipped">Dalam Pengiriman</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID Pesanan</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tanggal</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Total</th>
                                            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(order.status)}
                                                        <span className="text-sm font-mono text-gray-900">
                                                            {order.id.slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.profiles?.full_name || 'Customer'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        Rp {order.total.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setShowDetailModal(true)
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Detail Modal */}
                    {showDetailModal && selectedOrder && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Order Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ID Pesanan</p>
                                            <p className="text-sm font-mono font-semibold text-gray-900">{selectedOrder.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Customer</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {selectedOrder.profiles?.full_name || 'Customer'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Status Saat Ini</p>
                                            {getStatusBadge(selectedOrder.status)}
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Rp {(selectedOrder.total - selectedOrder.shipping_cost).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Ongkir</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Rp {selectedOrder.shipping_cost.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-semibold text-gray-900">Total</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    Rp {selectedOrder.total.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Actions */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-3">Update Status Pengiriman</p>
                                        <div className="flex gap-3">
                                            {selectedOrder.status === 'paid' && (
                                                <button
                                                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <Truck className="h-5 w-5" />
                                                    Kirim Pesanan
                                                </button>
                                            )}
                                            {selectedOrder.status === 'shipped' && (
                                                <button
                                                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                    Selesaikan Pengiriman
                                                </button>
                                            )}
                                            {selectedOrder.status === 'completed' && (
                                                <div className="flex-1 px-4 py-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                                                    ✓ Pengiriman Selesai
                                                </div>
                                            )}
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
