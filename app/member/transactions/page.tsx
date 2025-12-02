'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, Calendar, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import MemberLayout from '@/components/member/MemberLayout'

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
    total: number
    shipping_cost: number
    status: string
    payment_method: string | null
    payment_status: string | null
    shipping_address: string | null
    shipping_name: string | null
    shipping_phone: string | null
    created_at: string
    order_items: OrderItem[]
}

export default function MemberTransactionsPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredOrders(orders)
        } else {
            setFilteredOrders(orders.filter(order => order.status === statusFilter))
        }
    }, [orders, statusFilter])

    async function fetchOrders() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                return
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        id,
                        product_name,
                        quantity,
                        price,
                        subtotal
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            
            // Debug: Log data untuk cek order_items
            console.log('Orders fetched:', data)
            if (data && data.length > 0) {
                console.log('First order items:', data[0].order_items)
            }
            
            setOrders(data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
            showToast('Gagal memuat data transaksi', 'error')
        } finally {
            setLoading(false)
        }
    }


    function getStatusBadge(status: string) {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Menunggu Pembayaran' },
            paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Menunggu Pengiriman' },
            shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, text: 'Dalam Pengiriman' },
            completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Selesai' },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Dibatalkan' }
        }
        const badge = badges[status as keyof typeof badges] || badges.pending
        const Icon = badge.icon
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="h-3 w-3" />
                {badge.text}
            </span>
        )
    }

    if (loading) {
        return (
            <MemberLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat transaksi...</p>
                    </div>
                </div>
            </MemberLayout>
        )
    }

    return (
        <MemberLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600 rounded-lg">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
                                <p className="text-gray-600 text-sm">Daftar pesanan dan status pembayaran</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    {orders.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-xs text-gray-600 mb-1">Total Transaksi</p>
                                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-xs text-gray-600 mb-1">Menunggu Pembayaran</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {orders.filter(o => o.status === 'pending').length}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-xs text-gray-600 mb-1">Dalam Proses</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {orders.filter(o => o.status === 'paid' || o.status === 'shipped').length}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-xs text-gray-600 mb-1">Selesai</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {orders.filter(o => o.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Filter */}
                    {orders.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700">Filter Status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu Pembayaran</option>
                                    <option value="paid">Menunggu Pengiriman</option>
                                    <option value="shipped">Dalam Pengiriman</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                                <span className="text-sm text-gray-600">
                                    Menampilkan {filteredOrders.length} dari {orders.length} transaksi
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Transaksi</h3>
                            <p className="text-gray-600 mb-6">Anda belum memiliki transaksi pesanan</p>
                            <Link
                                href="/order"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Mulai Belanja
                            </Link>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Transaksi</h3>
                            <p className="text-gray-600 mb-6">Tidak ada transaksi dengan status yang dipilih</p>
                            <button
                                onClick={() => setStatusFilter('all')}
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Tampilkan Semua
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                    </h3>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-700">Produk yang dibeli:</p>
                                                {order.order_items && (
                                                    <span className="text-xs text-gray-500">
                                                        {order.order_items.length} item
                                                    </span>
                                                )}
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                {!order.order_items ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-sm text-gray-500">⚠️ Data produk tidak tersedia</p>
                                                        <p className="text-xs text-gray-400 mt-1">Order ID: {order.id}</p>
                                                    </div>
                                                ) : order.order_items.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-sm text-gray-500">📦 Belum ada produk dalam pesanan ini</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {order.order_items.map((item, index) => (
                                                            <div key={item.id || index} className="flex items-start justify-between gap-4 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {item.product_name || 'Produk tidak diketahui'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-xs text-gray-600">
                                                                            Qty: {item.quantity}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">×</span>
                                                                        <span className="text-xs text-gray-600">
                                                                            Rp {item.price.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        Rp {item.subtotal.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Shipping Info */}
                                        {order.shipping_address && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-xs font-medium text-blue-900 mb-1">Alamat Pengiriman:</p>
                                                <p className="text-sm text-blue-800">{order.shipping_name}</p>
                                                <p className="text-sm text-blue-700">{order.shipping_phone}</p>
                                                <p className="text-sm text-blue-700">{order.shipping_address}</p>
                                            </div>
                                        )}

                                        {/* Total */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal</span>
                                                    <span className="font-medium text-gray-900">
                                                        Rp {(order.total - order.shipping_cost).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Ongkos Kirim</span>
                                                    <span className="font-medium text-gray-900">
                                                        Rp {order.shipping_cost.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                    <span className="text-base font-semibold text-gray-900">Total Pembayaran</span>
                                                    <span className="text-2xl font-bold text-blue-600">
                                                        Rp {order.total.toLocaleString()}
                                                    </span>
                                                </div>
                                                {order.payment_method && (
                                                    <div className="flex items-center justify-between text-sm pt-2">
                                                        <span className="text-gray-600">Metode Pembayaran</span>
                                                        <span className="font-medium text-gray-900 uppercase">
                                                            {order.payment_method}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MemberLayout>
    )
}
