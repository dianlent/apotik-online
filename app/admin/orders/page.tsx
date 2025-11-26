'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Order, OrderStatus } from '@/types'
import { Search, Eye } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface OrderWithProfile extends Order {
    profiles?: {
        full_name: string | null
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderWithProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        setLoading(true)
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
        } catch (error) {
            console.error('Error loading orders:', error)
            showToast('Gagal memuat pesanan', 'error')
        } finally {
            setLoading(false)
        }
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

    return (
        <AuthGuard allowedRoles={['admin', 'kasir']}>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Daftar Pesanan</h1>
                        <p className="text-gray-600 mt-2">Monitor semua transaksi</p>
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
                                                        className="text-blue-600 hover:text-blue-900"
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
                </div>
            </div>
        </AuthGuard>
    )
}
