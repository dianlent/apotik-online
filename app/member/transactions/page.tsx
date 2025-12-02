'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, Calendar, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, User, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react'
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

            // Fetch orders first
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError
            
            if (!ordersData || ordersData.length === 0) {
                setOrders([])
                return
            }

            // Fetch order_items separately for each order
            const orderIds = ordersData.map(o => o.id)
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds)

            if (itemsError) {
                console.error('Error fetching order items:', itemsError)
            }

            // Combine orders with their items
            const ordersWithItems = ordersData.map(order => ({
                ...order,
                order_items: itemsData?.filter(item => item.order_id === order.id) || []
            }))
            
            // Debug: Log data untuk cek order_items
            console.log('Orders fetched:', ordersWithItems)
            if (ordersWithItems.length > 0) {
                console.log('First order items:', ordersWithItems[0].order_items)
            }
            
            setOrders(ordersWithItems)
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                    <ShoppingBag className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
                                    <p className="text-gray-600 text-sm">Lacak status pesanan online Anda</p>
                                </div>
                            </div>
                            <Link
                                href="/products"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <Package className="h-4 w-4" />
                                Belanja Lagi
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {orders.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Package className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Pesanan</p>
                                        <p className="text-xl font-bold text-gray-900">{orders.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Belum Bayar</p>
                                        <p className="text-xl font-bold text-yellow-600">
                                            {orders.filter(o => o.status === 'pending').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Dikemas</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {orders.filter(o => o.status === 'paid').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Truck className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Dikirim</p>
                                        <p className="text-xl font-bold text-purple-600">
                                            {orders.filter(o => o.status === 'shipped').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Selesai</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {orders.filter(o => o.status === 'completed').length}
                                        </p>
                                    </div>
                                </div>
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
                                            <div className="flex-1">
                                                {/* ID Pesanan Card */}
                                                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg px-4 py-2 mb-3">
                                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 font-medium">ID Pesanan</p>
                                                        <p className="text-sm font-mono font-bold text-indigo-600">
                                                            {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(order.status)}
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

                                        {/* Order Tracking Timeline */}
                                        <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                            <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <Truck className="h-4 w-4" />
                                                Status Pengiriman
                                            </p>
                                            <div className="flex items-center justify-between">
                                                {/* Step 1: Pesanan Dibuat */}
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        order.status !== 'cancelled' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                                                    }`}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 text-center">Pesanan<br/>Dibuat</p>
                                                </div>
                                                
                                                {/* Line */}
                                                <div className={`flex-1 h-1 mx-2 rounded ${
                                                    ['paid', 'shipped', 'completed'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'
                                                }`}></div>
                                                
                                                {/* Step 2: Pembayaran */}
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        ['paid', 'shipped', 'completed'].includes(order.status) ? 'bg-green-500 text-white' : 
                                                        order.status === 'pending' ? 'bg-yellow-500 text-white animate-pulse' : 'bg-gray-300 text-gray-500'
                                                    }`}>
                                                        <CreditCard className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 text-center">Pembayaran</p>
                                                </div>
                                                
                                                {/* Line */}
                                                <div className={`flex-1 h-1 mx-2 rounded ${
                                                    ['shipped', 'completed'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'
                                                }`}></div>
                                                
                                                {/* Step 3: Dikirim */}
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        ['shipped', 'completed'].includes(order.status) ? 'bg-green-500 text-white' :
                                                        order.status === 'paid' ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-300 text-gray-500'
                                                    }`}>
                                                        <Truck className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 text-center">Dikirim</p>
                                                </div>
                                                
                                                {/* Line */}
                                                <div className={`flex-1 h-1 mx-2 rounded ${
                                                    order.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                                }`}></div>
                                                
                                                {/* Step 4: Selesai */}
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        order.status === 'completed' ? 'bg-green-500 text-white' :
                                                        order.status === 'shipped' ? 'bg-purple-500 text-white animate-pulse' : 'bg-gray-300 text-gray-500'
                                                    }`}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 text-center">Selesai</p>
                                                </div>
                                            </div>
                                            
                                            {/* Cancelled Status */}
                                            {order.status === 'cancelled' && (
                                                <div className="mt-3 p-2 bg-red-100 rounded-lg text-center">
                                                    <p className="text-sm text-red-700 font-medium">❌ Pesanan Dibatalkan</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Shipping Info */}
                                        {order.shipping_address && (
                                            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                                <p className="text-xs font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    Alamat Pengiriman
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        <p className="text-sm font-medium text-gray-900">{order.shipping_name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-blue-600" />
                                                        <p className="text-sm text-gray-700">{order.shipping_phone}</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                                                        <p className="text-sm text-gray-700">{order.shipping_address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Summary */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                            <p className="text-xs font-semibold text-green-900 mb-3 flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Ringkasan Pembayaran
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal Produk</span>
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
                                                {order.payment_method && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Metode Pembayaran</span>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700 uppercase">
                                                            {order.payment_method === 'qris' ? '📱 QRIS' : 
                                                             order.payment_method === 'transfer' ? '🏦 Transfer' : 
                                                             order.payment_method === 'cash' ? '💵 Cash' : order.payment_method}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-3 mt-2 border-t border-green-200">
                                                    <span className="text-base font-semibold text-gray-900">Total Pembayaran</span>
                                                    <span className="text-2xl font-bold text-green-600">
                                                        Rp {order.total.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {order.status === 'pending' && (
                                            <div className="mt-4 flex gap-3">
                                                <Link
                                                    href={`/checkout?order=${order.id}`}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                    Bayar Sekarang
                                                </Link>
                                            </div>
                                        )}
                                        
                                        {order.status === 'shipped' && (
                                            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                <p className="text-sm text-purple-800 flex items-center gap-2">
                                                    <Truck className="h-4 w-4" />
                                                    <span>Pesanan sedang dalam perjalanan ke alamat Anda</span>
                                                </p>
                                            </div>
                                        )}
                                        
                                        {order.status === 'completed' && (
                                            <div className="mt-4 flex gap-3">
                                                <Link
                                                    href="/products"
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                    Pesan Lagi
                                                </Link>
                                            </div>
                                        )}
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
