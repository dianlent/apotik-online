'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserCog, Briefcase, Stethoscope, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function RequestRolePage() {
    const [selectedRole, setSelectedRole] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [currentRole, setCurrentRole] = useState<string>('')
    const [existingRequest, setExistingRequest] = useState<any>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    useEffect(() => {
        loadUserData()
    }, [])

    async function loadUserData() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setUserProfile(profile)
                setCurrentRole(profile.role)

                // Check for existing pending request
                const { data: requests } = await supabase
                    .from('role_requests')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(1)

                if (requests && requests.length > 0) {
                    setExistingRequest(requests[0])
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create role request
            const { error: requestError } = await supabase
                .from('role_requests')
                .insert({
                    user_id: user.id,
                    requested_role: selectedRole,
                    current_role: currentRole,
                    status: 'pending',
                    notes: notes || null
                })

            if (requestError) throw requestError

            // Update profile with pending status
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    requested_role: selectedRole,
                    role_request_status: 'pending',
                    role_request_date: new Date().toISOString()
                })
                .eq('id', user.id)

            if (profileError) throw profileError

            showToast('Permintaan role berhasil dikirim! Menunggu persetujuan admin.', 'success')
            setTimeout(() => {
                router.push('/')
            }, 2000)
        } catch (error) {
            console.error('Error submitting request:', error)
            showToast('Gagal mengirim permintaan. Silakan coba lagi.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        {
            id: 'kasir',
            name: 'Kasir',
            icon: Briefcase,
            description: 'Mengelola transaksi penjualan dan kasir',
            color: 'from-blue-500 to-indigo-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            id: 'apoteker',
            name: 'Apoteker',
            icon: Stethoscope,
            description: 'Mengelola obat dan memberikan konsultasi farmasi',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        }
    ]

    if (existingRequest) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container-responsive max-w-2xl">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
                                <Clock className="h-12 w-12 text-yellow-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Permintaan Sedang Diproses
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Anda sudah memiliki permintaan role yang sedang menunggu persetujuan admin
                            </p>

                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Role Diminta</p>
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {existingRequest.requested_role}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                            <Clock className="h-4 w-4" />
                                            Menunggu
                                        </span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-gray-600 mb-1">Tanggal Permintaan</p>
                                        <p className="text-gray-900">
                                            {new Date(existingRequest.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <AlertCircle className="h-4 w-4 inline mr-2" />
                                    Admin akan meninjau permintaan Anda dan memberikan keputusan dalam 1-3 hari kerja
                                </p>
                            </div>

                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-responsive max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
                        <UserCog className="h-12 w-12 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Ajukan Perubahan Role
                    </h1>
                    <p className="text-gray-600">
                        Pilih role yang Anda inginkan. Permintaan akan ditinjau oleh admin.
                    </p>
                </div>

                {/* Current Role */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <p className="text-sm text-gray-600 mb-2">Role Saat Ini</p>
                    <span className="inline-flex px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold capitalize">
                        {currentRole}
                    </span>
                </div>

                {/* Role Selection Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Pilih Role Baru</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {roles.map((role) => {
                                const Icon = role.icon
                                const isSelected = selectedRole === role.id

                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`text-left p-6 rounded-xl border-2 transition-all ${
                                            isSelected
                                                ? `${role.borderColor} ${role.bgColor} shadow-lg scale-105`
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 p-3 bg-gradient-to-br ${role.color} rounded-lg`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 mb-1">{role.name}</h3>
                                                <p className="text-sm text-gray-600">{role.description}</p>
                                                {isSelected && (
                                                    <div className="mt-3">
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catatan (Opsional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Jelaskan mengapa Anda ingin mengajukan role ini..."
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            Permintaan Anda akan ditinjau oleh admin. Proses persetujuan biasanya memakan waktu 1-3 hari kerja.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedRole || loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <UserCog className="h-5 w-5" />
                                    Ajukan Permintaan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
