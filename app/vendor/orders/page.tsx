'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Package, Calendar, TrendingUp, Eye, FileText } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface PurchaseOrder {
    id: string
    po_number: string
    order_date: string
    expected_delivery_date: string | null
    status: string
    subtotal: number
    tax: number
    shipping_cost: number
    total: number
    notes: string | null
    vendors: {
        vendor_name: string
        vendor_code: string
    }
}

interface OrderItem {
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    notes: string | null
    products: {
        name: string
        barcode: string | null
    }
}

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([])
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingItems, setLoadingItems] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
                    *,
                    vendors (
                        vendor_name,
                        vendor_code
                    )
                `)
                .order('order_date', { ascending: false })

            if (error) throw error

            setOrders(data || [])
        } catch (error) {
            console.error('Error loading orders:', error)
            showToast('Gagal memuat data pesanan', 'error')
        } finally {
            setLoading(false)
        }
    }

    async function loadOrderItems(orderId: string) {
        setLoadingItems(true)
        try {
            const { data, error } = await supabase
                .from('purchase_order_items')
                .select(`
                    *,
                    products (
                        name,
                        barcode
                    )
                `)
                .eq('purchase_order_id', orderId)

            if (error) throw error

            setOrderItems(data || [])
        } catch (error) {
            console.error('Error loading order items:', error)
            showToast('Gagal memuat detail pesanan', 'error')
        } finally {
            setLoadingItems(false)
        }
    }

    function viewOrderDetail(order: PurchaseOrder) {
        setSelectedOrder(order)
        setShowDetailModal(true)
        loadOrderItems(order.id)
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
            confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Dikonfirmasi' },
            shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Dikirim' },
            delivered: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Diterima' },
            cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Dibatalkan' }
        }
        const badge = badges[status] || badges.pending
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                {badge.label}
            </span>
        )
    }

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        totalValue: orders.reduce((sum, o) => sum + Number(o.total), 0)
    }

    return (
        <AuthGuard allowedRoles={['vendor', 'admin']}>
            <div className="min-h-screen bg-gray-50">
                <div className="container-responsive py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-responsive-lg font-bold text-gray-900 flex items-center gap-3">
                            <Package className="h-8 w-8 text-blue-600" />
                            History Pemesanan
                        </h1>
                        <p className="text-gray-600 mt-2">Lihat riwayat pesanan obat dan barang</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <FileText className="h-10 w-10 text-blue-600 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Calendar className="h-10 w-10 text-yellow-600 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Selesai</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                                </div>
                                <Package className="h-10 w-10 text-green-600 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Nilai</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        Rp {(stats.totalValue / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-blue-600 opacity-20" />
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Memuat data...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Belum ada pesanan</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No. PO
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Vendor
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.po_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(order.order_date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {order.vendors?.vendor_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.vendors?.vendor_code}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        Rp {Number(order.total).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => viewOrderDetail(order)}
                                                        className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Detail Pesanan {selectedOrder.po_number}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(selectedOrder.order_date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Vendor</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedOrder.vendors?.vendor_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                                {selectedOrder.expected_delivery_date && (
                                    <div>
                                        <p className="text-sm text-gray-600">Estimasi Pengiriman</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(selectedOrder.expected_delivery_date).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">Item Pesanan</h3>
                                {loadingItems ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Produk
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                        Qty
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                        Harga
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                        Subtotal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {orderItems.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.products?.name}
                                                            </div>
                                                            {item.products?.barcode && (
                                                                <div className="text-xs text-gray-500">
                                                                    {item.products.barcode}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                            Rp {Number(item.unit_price).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                                            Rp {Number(item.subtotal).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">Rp {Number(selectedOrder.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Pajak</span>
                                        <span className="font-medium">Rp {Number(selectedOrder.tax).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ongkir</span>
                                        <span className="font-medium">Rp {Number(selectedOrder.shipping_cost).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                        <span>Total</span>
                                        <span className="text-blue-600">Rp {Number(selectedOrder.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-900 mb-1">Catatan:</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthGuard>
    )
}
