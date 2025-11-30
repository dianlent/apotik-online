'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, Calendar, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import MemberLayout from '@/components/member/MemberLayout'

interface Order {
    id: string
    order_number: string
    total_amount: number
    payment_status: 'pending' | 'paid' | 'failed' | 'expired'
    order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    created_at: string
}

export default function MemberTransactionsPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchOrders() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
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
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Menunggu Konfirmasi' },
            processing: { color: 'bg-blue-100 text-blue-800', icon: Truck, text: 'Sedang Diproses' },
            shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, text: 'Dalam Pengiriman' },
            delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Terkirim' },
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
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {order.order_number}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Pembayaran</p>
                                                        {getPaymentStatusBadge(order.payment_status)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Pengiriman</p>
                                                        {getOrderStatusBadge(order.order_status)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        Rp {order.total_amount.toLocaleString()}
                                                    </p>
                                                </div>
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
