'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Package, Calendar, CreditCard, Eye, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import AuthGuard from '@/components/AuthGuard'
import MemberLayout from '@/components/member/MemberLayout'

interface Order {
    id: string
    order_number: string
    total_amount: number
    payment_status: 'pending' | 'paid' | 'failed' | 'expired'
    order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    created_at: string
    items?: OrderItem[]
}

interface OrderItem {
    id: string
    product_name: string
    quantity: number
    price: number
    subtotal: number
}

export default function MemberTransactionsPage() {
    return (
        <MemberLayout>
            <MemberTransactionsContent />
        </MemberLayout>
    )
}

function MemberTransactionsContent() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [loadingItems, setLoadingItems] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
            showToast('Gagal memuat data transaksi', 'error')
        } finally {
            setLoading(false)
        }
    }

    async function fetchOrderItems(orderId: string) {
        setLoadingItems(true)
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId)

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching order items:', error)
            showToast('Gagal memuat detail pesanan', 'error')
            return []
        } finally {
            setLoadingItems(false)
        }
    }

    async function viewOrderDetail(order: Order) {
        const items = await fetchOrderItems(order.id)
        setSelectedOrder({ ...order, items })
        setShowDetailModal(true)
    }

    function getPaymentStatusBadge(status: string) {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Menunggu' },
            paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Lunas' },
            failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Gagal' },
            expired: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Expired' }
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

    function getOrderStatusBadge(status: string) {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-800', text: 'Diproses' },
            shipped: { color: 'bg-purple-100 text-purple-800', text: 'Dikirim' },
            delivered: { color: 'bg-green-100 text-green-800', text: 'Selesai' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'Dibatalkan' }
        }
        const badge = badges[status as keyof typeof badges] || badges.pending
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.text}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat transaksi...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-responsive max-w-5xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Kembali
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Transaksi Saya</h1>
                            <p className="text-gray-600 text-sm">Riwayat pesanan dan pembayaran</p>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Transaksi</h3>
                        <p className="text-gray-600 mb-6">Anda belum memiliki transaksi pesanan</p>
                        <button
                            onClick={() => router.push('/order')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {order.order_number}
                                            </h3>
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
                                        <button
                                            onClick={() => viewOrderDetail(order)}
                                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Detail
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-4">
                                            {getPaymentStatusBadge(order.payment_status)}
                                            {getOrderStatusBadge(order.order_status)}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Total</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                Rp {order.total_amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedOrder.order_number}</h2>
                                        <p className="text-blue-100 text-sm mt-1">
                                            {new Date(selectedOrder.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Status */}
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Status Pembayaran</p>
                                            {getPaymentStatusBadge(selectedOrder.payment_status)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Status Pesanan</p>
                                            {getOrderStatusBadge(selectedOrder.order_status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk</h3>
                                    {loadingItems ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        </div>
                                    ) : selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedOrder.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.product_name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {item.quantity} x Rp {item.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold text-gray-900">
                                                        Rp {item.subtotal.toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Tidak ada detail produk</p>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-blue-600">
                                            Rp {selectedOrder.total_amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
