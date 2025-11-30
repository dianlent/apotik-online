'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, MapPin, Phone, Mail, Home, Save, ArrowLeft } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import Link from 'next/link'
import MemberLayout from '@/components/member/MemberLayout'

interface ProfileData {
    full_name: string
    email: string
    phone: string
    address: string
    city: string
    province: string
    postal_code: string
    notes: string
}

export default function MemberProfilePage() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [userId, setUserId] = useState<string>('')
    const [profileData, setProfileData] = useState<ProfileData>({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        notes: ''
    })
    const [isProfileComplete, setIsProfileComplete] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    useEffect(() => {
        checkAuthAndLoadProfile()
    }, [])

    async function checkAuthAndLoadProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                showToast('Silakan login terlebih dahulu', 'error')
                router.push('/login')
                return
            }

            setUserId(user.id)

            // Get user profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error

            if (profile) {
                // Check if user is customer/member
                if (profile.role !== 'customer') {
                    showToast('Halaman ini khusus untuk member', 'error')
                    router.push('/')
                    return
                }

                setProfileData({
                    full_name: profile.full_name || '',
                    email: user.email || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                    city: profile.city || '',
                    province: profile.province || '',
                    postal_code: profile.postal_code || '',
                    notes: profile.notes || ''
                })

                // Check if profile is complete
                checkProfileComplete(profile)
            }
        } catch (error) {
            console.error('Error loading profile:', error)
            showToast('Gagal memuat profil', 'error')
        } finally {
            setLoading(false)
        }
    }

    function checkProfileComplete(profile: any) {
        const required = [
            profile.full_name,
            profile.phone,
            profile.address,
            profile.city,
            profile.province,
            profile.postal_code
        ]
        const complete = required.every(field => field && field.trim() !== '')
        setIsProfileComplete(complete)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        
        // Validate required fields
        if (!profileData.full_name || !profileData.phone || !profileData.address || 
            !profileData.city || !profileData.province || !profileData.postal_code) {
            showToast('Mohon lengkapi semua field yang wajib diisi', 'error')
            return
        }

        setSubmitting(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                    address: profileData.address,
                    city: profileData.city,
                    province: profileData.province,
                    postal_code: profileData.postal_code,
                    notes: profileData.notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (error) throw error

            showToast('Profil berhasil diperbarui', 'success')
            
            // Check if profile is now complete
            checkProfileComplete(profileData)
            
            // Redirect back to dashboard
            setTimeout(() => {
                router.push('/member')
            }, 1500)
        } catch (error) {
            console.error('Error updating profile:', error)
            showToast('Gagal memperbarui profil', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat profil...</p>
                </div>
            </div>
        )
    }

    return (
        <MemberLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div className="container-responsive max-w-4xl">
                {/* Back Button */}
                <Link
                    href="/member"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Kembali ke Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <User className="h-8 w-8 text-blue-600" />
                        Edit Profil Member
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Lengkapi informasi profil Anda untuk pengiriman online
                    </p>
                </div>

                {/* Alert if profile incomplete */}
                {!isProfileComplete && (
                    <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-1">
                                    Profil Belum Lengkap
                                </h3>
                                <p className="text-sm text-yellow-800">
                                    Mohon lengkapi semua informasi profil Anda untuk dapat melakukan pemesanan online dengan pengiriman gratis.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Free Shipping Banner */}
                <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="p-3 bg-white/20 rounded-full">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">🎉 Pengiriman GRATIS!</h3>
                            <p className="text-green-100">
                                Nikmati pengiriman gratis untuk semua pemesanan online Anda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Informasi Pribadi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profileData.email}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="inline h-4 w-4 mr-1" />
                                        Nomor Telepon <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="081234567890"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="p-6 border-b border-gray-200 bg-blue-50">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                Alamat Pengiriman
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Home className="inline h-4 w-4 mr-1" />
                                        Alamat Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Jl. Contoh No. 123, RT/RW 001/002, Kelurahan"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Masukkan alamat lengkap termasuk RT/RW, Kelurahan
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kota/Kabupaten <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.city}
                                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Jakarta Selatan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provinsi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.province}
                                            onChange={(e) => setProfileData({ ...profileData, province: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="DKI Jakarta"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kode Pos <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.postal_code}
                                            onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="12345"
                                            maxLength={5}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catatan Tambahan (Opsional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={profileData.notes}
                                        onChange={(e) => setProfileData({ ...profileData, notes: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Patokan, warna rumah, atau informasi tambahan lainnya"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="p-6 bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            Simpan Profil
                                        </>
                                    )}
                                </button>
                                <Link
                                    href="/member"
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </Link>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-4">
                                <span className="text-red-500">*</span> Field wajib diisi untuk dapat melakukan pemesanan online
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </MemberLayout>
    )
}
