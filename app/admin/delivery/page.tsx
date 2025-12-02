'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Truck, Package, CheckCircle, Clock, MapPin, Phone, User, Calendar, Search, Printer, Download } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { useSettings } from '@/context/SettingsContext'

interface OrderItem {
    id: string
    product_name: string
    quantity: number
    price: number
    subtotal: number
}

interface Order {
    id: string
    order_number: string | null
    user_id: string
    total: number
    shipping_cost: number
    status: string
    payment_method: string | null
    payment_status: string | null
    shipping_address: string | null
    shipping_name: string | null
    shipping_phone: string | null
    created_at: string
    profiles?: {
        full_name: string
    }
    order_items?: OrderItem[]
}

interface DeliveryStats {
    pending: number
    paid: number
    shipped: number
    completed: number
    cancelled: number
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
        paid: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
        total: 0
    })
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
    const supabase = createClient()
    const { showToast } = useToast()
    const { generalSettings } = useSettings()

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
                    ),
                    order_items (
                        id,
                        product_name,
                        quantity,
                        price,
                        subtotal
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            setOrders(data || [])

            // Calculate stats
            const pending = data?.filter(o => o.status === 'pending').length || 0
            const paid = data?.filter(o => o.status === 'paid').length || 0
            const shipped = data?.filter(o => o.status === 'shipped').length || 0
            const completed = data?.filter(o => o.status === 'completed').length || 0
            const cancelled = data?.filter(o => o.status === 'cancelled').length || 0

            setStats({
                pending,
                paid,
                shipped,
                completed,
                cancelled,
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

    async function updateOrderStatus(orderId: string, newStatus: string, closeModal: boolean = false) {
        setUpdatingStatus(orderId)
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            showToast('Status pesanan berhasil diupdate', 'success')
            await loadOrders()
            if (closeModal) {
                setShowDetailModal(false)
            }
        } catch (error) {
            console.error('Error updating order status:', error)
            showToast('Gagal mengupdate status', 'error')
        } finally {
            setUpdatingStatus(null)
        }
    }

    function handlePrint() {
        window.print()
    }

    function handleDownloadPDF() {
        // Menggunakan browser native print dialog dengan opsi "Save as PDF"
        showToast('Silakan pilih "Save as PDF" di dialog print', 'info')
        window.print()
    }

    function getStatusBadge(status: string) {
        const badges = {
            pending: { label: 'Menunggu Pembayaran', color: 'bg-orange-100 text-orange-800' },
            paid: { label: 'Menunggu Pengiriman', color: 'bg-yellow-100 text-yellow-800' },
            shipped: { label: 'Dalam Pengiriman', color: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
            cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
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
            case 'pending':
                return <Clock className="h-5 w-5 text-orange-600" />
            case 'paid':
                return <Package className="h-5 w-5 text-yellow-600" />
            case 'shipped':
                return <Truck className="h-5 w-5 text-blue-600" />
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'cancelled':
                return (
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
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
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Menunggu Pembayaran</h3>
                            <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Package className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Menunggu Pengiriman</h3>
                            <p className="text-xl font-bold text-gray-900">{stats.paid}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Dalam Pengiriman</h3>
                            <p className="text-xl font-bold text-gray-900">{stats.shipped}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Selesai</h3>
                            <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Dibatalkan</h3>
                            <p className="text-xl font-bold text-gray-900">{stats.cancelled}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Package className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium mb-1">Total Pesanan</h3>
                            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
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
                                <option value="pending">Menunggu Pembayaran</option>
                                <option value="paid">Menunggu Pengiriman</option>
                                <option value="shipped">Dalam Pengiriman</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
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
                                            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Pembayaran</th>
                                            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status Pengiriman</th>
                                            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(order.status)}
                                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg px-3 py-1.5">
                                                            <div className="p-1 bg-indigo-100 rounded">
                                                                <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-xs font-mono font-bold text-indigo-600">
                                                                {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                            </span>
                                                        </div>
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
                                                    {order.payment_status === 'paid' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Lunas
                                                        </span>
                                                    ) : order.payment_status === 'pending' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                            <Clock className="h-3 w-3" />
                                                            Menunggu
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        disabled={updatingStatus === order.id}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                                                            order.status === 'pending' 
                                                                ? 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100' 
                                                                : order.status === 'paid' 
                                                                ? 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100' 
                                                                : order.status === 'shipped' 
                                                                ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100' 
                                                                : order.status === 'completed'
                                                                ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                                                                : 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
                                                        }`}
                                                    >
                                                        <option value="paid">Menunggu Pengiriman</option>
                                                        <option value="shipped">Dalam Pengiriman</option>
                                                        <option value="completed">Selesai</option>
                                                        <option value="cancelled">Dibatalkan</option>
                                                    </select>
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
                            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 invoice-content">
                                <div className="flex items-center justify-between mb-6 no-print">
                                    <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download PDF
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Printer className="h-4 w-4" />
                                            Cetak
                                        </button>
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Print Header - Only visible when printing */}
                                <div className="print-only mb-6">
                                    <div className="text-center mb-6">
                                        {generalSettings?.storeLogo && (
                                            <div className="flex justify-center mb-4">
                                                <img 
                                                    src={generalSettings.storeLogo} 
                                                    alt={generalSettings.storeName || 'Logo'} 
                                                    className="h-16 w-auto object-contain"
                                                />
                                            </div>
                                        )}
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                        <p className="text-sm text-gray-600 font-semibold">{generalSettings?.storeName || 'Apotik Online'}</p>
                                        <p className="text-xs text-gray-500">{generalSettings?.storeAddress || 'Jl. Kesehatan No. 123, Jakarta'}</p>
                                        <p className="text-xs text-gray-500">Telp: {generalSettings?.storePhone || '(021) 1234-5678'}</p>
                                        {generalSettings?.storeEmail && (
                                            <p className="text-xs text-gray-500">Email: {generalSettings.storeEmail}</p>
                                        )}
                                    </div>
                                    <div className="border-b-2 border-gray-300 mb-4"></div>
                                </div>

                                <div className="space-y-6">
                                    {/* Order ID Card - Full Width */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 font-medium mb-0.5">ID Pesanan</p>
                                                <p className="text-lg font-mono font-bold text-indigo-600">
                                                    {selectedOrder.order_number || `#${selectedOrder.id.slice(0, 8).toUpperCase()}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Info */}
                                    <div className="grid grid-cols-2 gap-4">
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
                                            <p className="text-sm text-gray-600 mb-1">Status Pengiriman</p>
                                            {getStatusBadge(selectedOrder.status)}
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div className="border-t border-gray-200 pt-4 no-print">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Status Pembayaran</p>
                                            {selectedOrder.payment_status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Lunas (QRIS)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                                    <Clock className="h-4 w-4" />
                                                    Menunggu Pembayaran QRIS
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    {selectedOrder.shipping_address && (
                                        <div className="border-t border-gray-200 pt-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Alamat Pengiriman</h3>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-900">{selectedOrder.shipping_name}</p>
                                                <p className="text-sm text-gray-700">{selectedOrder.shipping_phone}</p>
                                                <p className="text-sm text-gray-700 mt-1">{selectedOrder.shipping_address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                                        <div className="border-t border-gray-200 pt-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Produk yang Dipesan</h3>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-700">Produk</th>
                                                            <th className="text-center py-2 px-4 text-xs font-semibold text-gray-700">Qty</th>
                                                            <th className="text-right py-2 px-4 text-xs font-semibold text-gray-700">Harga</th>
                                                            <th className="text-right py-2 px-4 text-xs font-semibold text-gray-700">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedOrder.order_items.map((item) => (
                                                            <tr key={item.id} className="border-t border-gray-100">
                                                                <td className="py-2 px-4 text-sm text-gray-900">{item.product_name}</td>
                                                                <td className="py-2 px-4 text-sm text-center text-gray-900">{item.quantity}</td>
                                                                <td className="py-2 px-4 text-sm text-right text-gray-900">
                                                                    Rp {item.price.toLocaleString()}
                                                                </td>
                                                                <td className="py-2 px-4 text-sm text-right font-semibold text-gray-900">
                                                                    Rp {item.subtotal.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

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
                                    <div className="border-t border-gray-200 pt-4 no-print">
                                        <p className="text-sm font-medium text-gray-700 mb-3">Aksi Pengiriman</p>
                                        <div className="flex gap-3">
                                            {selectedOrder.status === 'paid' && (
                                                <button
                                                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped', true)}
                                                    disabled={updatingStatus === selectedOrder.id}
                                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Truck className="h-5 w-5" />
                                                    {updatingStatus === selectedOrder.id ? 'Memproses...' : 'Kirim Pesanan'}
                                                </button>
                                            )}
                                            {selectedOrder.status === 'shipped' && (
                                                <button
                                                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed', true)}
                                                    disabled={updatingStatus === selectedOrder.id}
                                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                    {updatingStatus === selectedOrder.id ? 'Memproses...' : 'Selesaikan Pengiriman'}
                                                </button>
                                            )}
                                            {selectedOrder.status === 'completed' && (
                                                <div className="flex-1 px-4 py-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                                                    ✓ Pengiriman Selesai
                                                </div>
                                            )}
                                            {selectedOrder.status === 'pending' && (
                                                <div className="flex-1 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center font-medium">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Clock className="h-5 w-5" />
                                                        Menunggu Pembayaran Customer
                                                    </div>
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

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    
                    /* Hide everything except modal content */
                    body * {
                        visibility: hidden;
                    }
                    
                    .fixed.inset-0 * {
                        visibility: visible;
                    }
                    
                    /* Hide modal overlay and make content full width */
                    .fixed.inset-0 {
                        position: static !important;
                        background: white !important;
                    }
                    
                    .fixed.inset-0 > div {
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    /* Hide elements with no-print class */
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Show print-only elements */
                    .print-only {
                        display: block !important;
                    }
                    
                    /* Compact print header */
                    .print-only {
                        margin-bottom: 8px !important;
                    }
                    
                    .print-only h1 {
                        font-size: 20pt !important;
                        margin-bottom: 4px !important;
                    }
                    
                    .print-only p {
                        font-size: 9pt !important;
                        margin: 0 !important;
                        line-height: 1.2 !important;
                    }
                    
                    .print-only .border-b-2 {
                        margin: 8px 0 !important;
                    }
                    
                    /* Compact spacing */
                    .space-y-6 {
                        gap: 8px !important;
                    }
                    
                    .space-y-6 > div {
                        margin-top: 0 !important;
                        margin-bottom: 8px !important;
                        padding-top: 6px !important;
                        page-break-inside: avoid;
                    }
                    
                    /* Compact grid */
                    .grid {
                        gap: 6px !important;
                    }
                    
                    /* Compact text */
                    .text-sm, .text-xs {
                        font-size: 9pt !important;
                        line-height: 1.2 !important;
                    }
                    
                    .text-lg {
                        font-size: 11pt !important;
                    }
                    
                    .text-2xl {
                        font-size: 14pt !important;
                    }
                    
                    h3 {
                        font-size: 10pt !important;
                        margin-bottom: 4px !important;
                    }
                    
                    /* Compact padding */
                    .p-4, .p-6 {
                        padding: 4px !important;
                    }
                    
                    .py-2, .py-4 {
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                    }
                    
                    .px-4, .px-6 {
                        padding-left: 4px !important;
                        padding-right: 4px !important;
                    }
                    
                    .mb-1, .mb-2, .mb-3, .mb-4, .mb-6 {
                        margin-bottom: 2px !important;
                    }
                    
                    .mt-1, .mt-4 {
                        margin-top: 2px !important;
                    }
                    
                    .pt-4 {
                        padding-top: 6px !important;
                    }
                    
                    /* Compact table */
                    table {
                        page-break-inside: avoid;
                        font-size: 9pt !important;
                    }
                    
                    table th, table td {
                        padding: 3px 4px !important;
                    }
                    
                    /* Remove background colors for print */
                    .bg-gray-50, .bg-blue-50, .bg-yellow-50, .bg-green-50, .bg-gray-100 {
                        background-color: white !important;
                        border: 1px solid #e5e7eb !important;
                    }
                    
                    .rounded-lg, .rounded-xl {
                        border-radius: 4px !important;
                    }
                    
                    /* Ensure single page */
                    .invoice-content {
                        max-height: 277mm !important;
                        overflow: hidden !important;
                    }
                }
                
                /* Hide print-only elements on screen */
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }
            `}</style>
        </AuthGuard>
    )
}
