'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { CheckCircle, XCircle, Clock, User, Mail, Calendar } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface RoleRequest {
    id: string
    user_id: string
    requested_role: string
    current_role: string
    status: string
    notes: string | null
    created_at: string
    profiles: {
        full_name: string
        email: string
    }
}

export default function RoleRequestsPage() {
    const [requests, setRequests] = useState<RoleRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadRequests()
    }, [])

    async function loadRequests() {
        try {
            const { data, error } = await supabase
                .from('role_requests')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        email
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            setRequests(data || [])
        } catch (error) {
            console.error('Error loading requests:', error)
            showToast('Gagal memuat permintaan role', 'error')
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove(requestId: string) {
        setProcessing(requestId)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase.rpc('approve_role_request', {
                request_id: requestId,
                admin_id: user.id
            })

            if (error) throw error

            showToast('Role berhasil disetujui!', 'success')
            loadRequests()
        } catch (error) {
            console.error('Error approving request:', error)
            showToast('Gagal menyetujui role', 'error')
        } finally {
            setProcessing(null)
        }
    }

    async function handleReject(requestId: string, reason?: string) {
        setProcessing(requestId)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase.rpc('reject_role_request', {
                request_id: requestId,
                admin_id: user.id,
                reason: reason || 'Tidak memenuhi syarat'
            })

            if (error) throw error

            showToast('Role ditolak', 'success')
            loadRequests()
        } catch (error) {
            console.error('Error rejecting request:', error)
            showToast('Gagal menolak role', 'error')
        } finally {
            setProcessing(null)
        }
    }

    const getRoleBadge = (role: string) => {
        const badges: Record<string, { color: string; label: string }> = {
            kasir: { color: 'bg-blue-100 text-blue-800', label: 'Kasir' },
            apoteker: { color: 'bg-green-100 text-green-800', label: 'Apoteker' },
            admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
            customer: { color: 'bg-gray-100 text-gray-800', label: 'Customer' }
        }
        const badge = badges[role] || badges.customer
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.label}
            </span>
        )
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: any; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Menunggu' },
            approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Disetujui' },
            rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Ditolak' }
        }
        const badge = badges[status] || badges.pending
        const Icon = badge.icon

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                <Icon className="h-3 w-3" />
                {badge.label}
            </span>
        )
    }

    const pendingRequests = requests.filter(r => r.status === 'pending')
    const processedRequests = requests.filter(r => r.status !== 'pending')

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50">
                <div className="container-responsive py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-responsive-lg font-bold text-gray-900">Permintaan Perubahan Role</h1>
                        <p className="text-gray-600 mt-2">Kelola permintaan role dari kasir dan apoteker</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Memuat data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Pending Requests */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Menunggu Persetujuan ({pendingRequests.length})
                                </h2>

                                {pendingRequests.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Tidak ada permintaan yang menunggu</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {pendingRequests.map((request) => (
                                            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                                                    <User className="h-6 w-6 text-blue-600" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                                    {request.profiles?.full_name || 'Unknown User'}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                                    <Mail className="h-4 w-4" />
                                                                    {request.profiles?.email}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-3">
                                                                    <span className="text-sm text-gray-600">Role saat ini:</span>
                                                                    {getRoleBadge(request.current_role)}
                                                                    <span className="text-gray-400">→</span>
                                                                    <span className="text-sm text-gray-600">Diminta:</span>
                                                                    {getRoleBadge(request.requested_role)}
                                                                </div>
                                                                {request.notes && (
                                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                                        <p className="text-sm text-gray-700">
                                                                            <strong>Catatan:</strong> {request.notes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(request.created_at).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={processing === request.id}
                                                            className="btn-touch px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                        >
                                                            {processing === request.id ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    Memproses...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-5 w-5" />
                                                                    Setujui
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={processing === request.id}
                                                            className="btn-touch px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                            Tolak
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Processed Requests */}
                            {processedRequests.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Riwayat ({processedRequests.length})
                                    </h2>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            User
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Role
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Tanggal
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {processedRequests.map((request) => (
                                                        <tr key={request.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {request.profiles?.full_name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {request.profiles?.email}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    {getRoleBadge(request.current_role)}
                                                                    <span className="text-gray-400">→</span>
                                                                    {getRoleBadge(request.requested_role)}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {getStatusBadge(request.status)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(request.created_at).toLocaleDateString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    )
}
