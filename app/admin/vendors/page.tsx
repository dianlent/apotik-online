'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Plus, Edit, Trash2, Search, Building2, Phone, Mail, MapPin, CreditCard, X } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface Vendor {
    id: string
    vendor_code: string
    vendor_name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    postal_code: string | null
    country: string
    tax_id: string | null
    payment_terms: string | null
    credit_limit: number
    notes: string | null
    status: 'active' | 'inactive' | 'suspended'
    created_at: string
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
    const [formData, setFormData] = useState({
        vendor_code: '',
        vendor_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Indonesia',
        tax_id: '',
        payment_terms: '',
        credit_limit: 0,
        notes: '',
        status: 'active' as 'active' | 'inactive' | 'suspended'
    })
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadVendors()
    }, [])

    useEffect(() => {
        filterVendors()
    }, [searchQuery, vendors])

    async function loadVendors() {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            setVendors(data || [])
        } catch (error) {
            console.error('Error loading vendors:', error)
            showToast('Gagal memuat data vendor', 'error')
        } finally {
            setLoading(false)
        }
    }

    function filterVendors() {
        if (!searchQuery.trim()) {
            setFilteredVendors(vendors)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = vendors.filter(vendor =>
            vendor.vendor_name.toLowerCase().includes(query) ||
            vendor.vendor_code.toLowerCase().includes(query) ||
            vendor.contact_person?.toLowerCase().includes(query) ||
            vendor.email?.toLowerCase().includes(query) ||
            vendor.phone?.toLowerCase().includes(query)
        )
        setFilteredVendors(filtered)
    }

    function openModal(vendor?: Vendor) {
        if (vendor) {
            setEditingVendor(vendor)
            setFormData({
                vendor_code: vendor.vendor_code,
                vendor_name: vendor.vendor_name,
                contact_person: vendor.contact_person || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                address: vendor.address || '',
                city: vendor.city || '',
                postal_code: vendor.postal_code || '',
                country: vendor.country,
                tax_id: vendor.tax_id || '',
                payment_terms: vendor.payment_terms || '',
                credit_limit: vendor.credit_limit,
                notes: vendor.notes || '',
                status: vendor.status
            })
        } else {
            setEditingVendor(null)
            setFormData({
                vendor_code: '',
                vendor_name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postal_code: '',
                country: 'Indonesia',
                tax_id: '',
                payment_terms: '',
                credit_limit: 0,
                notes: '',
                status: 'active'
            })
        }
        setShowModal(true)
    }

    function closeModal() {
        setShowModal(false)
        setEditingVendor(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const vendorData = {
                ...formData,
                credit_limit: Number(formData.credit_limit),
                created_by: editingVendor ? undefined : user.id
            }

            if (editingVendor) {
                const { error } = await supabase
                    .from('vendors')
                    .update(vendorData)
                    .eq('id', editingVendor.id)

                if (error) throw error
                showToast('Vendor berhasil diupdate!', 'success')
            } else {
                const { error } = await supabase
                    .from('vendors')
                    .insert(vendorData)

                if (error) throw error
                showToast('Vendor berhasil ditambahkan!', 'success')
            }

            closeModal()
            loadVendors()
        } catch (error: any) {
            console.error('Error saving vendor:', error)
            showToast(error.message || 'Gagal menyimpan vendor', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(vendor: Vendor) {
        if (!confirm(`Hapus vendor ${vendor.vendor_name}?`)) return

        try {
            const { error } = await supabase
                .from('vendors')
                .delete()
                .eq('id', vendor.id)

            if (error) throw error

            showToast('Vendor berhasil dihapus!', 'success')
            loadVendors()
        } catch (error) {
            console.error('Error deleting vendor:', error)
            showToast('Gagal menghapus vendor', 'error')
        }
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            active: 'bg-green-100 text-green-800 border-green-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
            suspended: 'bg-red-100 text-red-800 border-red-200'
        }
        const labels = {
            active: 'Aktif',
            inactive: 'Tidak Aktif',
            suspended: 'Ditangguhkan'
        }
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        )
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50">
                <div className="container-responsive py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-responsive-lg font-bold text-gray-900 flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            Manajemen Vendor
                        </h1>
                        <p className="text-gray-600 mt-2">Kelola data vendor dan supplier produk</p>
                    </div>

                    {/* Actions Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari vendor..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="btn-touch px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md"
                            >
                                <Plus className="h-5 w-5" />
                                Tambah Vendor
                            </button>
                        </div>
                    </div>

                    {/* Vendors List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Memuat data...</p>
                        </div>
                    ) : filteredVendors.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                {searchQuery ? 'Vendor tidak ditemukan' : 'Belum ada vendor'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => openModal()}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Tambah Vendor Pertama
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredVendors.map((vendor) => (
                                <div key={vendor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{vendor.vendor_name}</h3>
                                                {getStatusBadge(vendor.status)}
                                            </div>
                                            <p className="text-sm text-gray-500">Kode: {vendor.vendor_code}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModal(vendor)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vendor)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {vendor.contact_person && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-4 w-4 flex-shrink-0" />
                                                <span>{vendor.contact_person}</span>
                                            </div>
                                        )}
                                        {vendor.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-4 w-4 flex-shrink-0" />
                                                <a href={`tel:${vendor.phone}`} className="hover:text-blue-600">
                                                    {vendor.phone}
                                                </a>
                                            </div>
                                        )}
                                        {vendor.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="h-4 w-4 flex-shrink-0" />
                                                <a href={`mailto:${vendor.email}`} className="hover:text-blue-600">
                                                    {vendor.email}
                                                </a>
                                            </div>
                                        )}
                                        {vendor.address && (
                                            <div className="flex items-start gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                <span>{vendor.address}{vendor.city && `, ${vendor.city}`}</span>
                                            </div>
                                        )}
                                        {vendor.payment_terms && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <CreditCard className="h-4 w-4 flex-shrink-0" />
                                                <span>Payment: {vendor.payment_terms}</span>
                                            </div>
                                        )}
                                    </div>

                                    {vendor.credit_limit > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                Credit Limit: <span className="font-semibold text-gray-900">
                                                    Rp {vendor.credit_limit.toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingVendor ? 'Edit Vendor' : 'Tambah Vendor'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode Vendor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.vendor_code}
                                        onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Auto-generate jika kosong"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Vendor <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.vendor_name}
                                        onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="PT. Vendor Name"
                                    />
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+62 812-3456-7890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="vendor@example.com"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alamat
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Jl. Vendor Street No. 123"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kota
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Jakarta"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode Pos
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="12345"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Negara
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Financial Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        NPWP
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tax_id}
                                        onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="00.000.000.0-000.000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Terms
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.payment_terms}
                                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Net 30, COD, etc"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Credit Limit (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.credit_limit}
                                        onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        step="1000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Tidak Aktif</option>
                                        <option value="suspended">Ditangguhkan</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Catatan tambahan..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Menyimpan...' : editingVendor ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthGuard>
    )
}
