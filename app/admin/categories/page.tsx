'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Plus, Edit, Trash2, Tag, Package, Download } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { seedPharmacyCategories } from '@/lib/seed-categories'

interface Category {
    id: string
    name: string
    description: string | null
    product_count?: number
    created_at: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [seeding, setSeeding] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadCategories()
    }, [])

    async function loadCategories() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (error) throw error

            // Count products per category
            const categoriesWithCount = await Promise.all(
                (data || []).map(async (category) => {
                    const { count } = await supabase
                        .from('products')
                        .select('*', { count: 'exact', head: true })
                        .eq('category_id', category.id)
                    
                    return { ...category, product_count: count || 0 }
                })
            )

            setCategories(categoriesWithCount)
        } catch (error) {
            console.error('Error loading categories:', error)
            showToast('Gagal memuat kategori', 'error')
        } finally {
            setLoading(false)
        }
    }

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            setFormData({
                name: category.name,
                description: category.description || ''
            })
        } else {
            setEditingCategory(null)
            setFormData({
                name: '',
                description: ''
            })
        }
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const categoryData = {
                name: formData.name,
                description: formData.description || null
            }

            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .update(categoryData)
                    .eq('id', editingCategory.id)

                if (error) throw error
                showToast('Kategori berhasil diupdate', 'success')
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert(categoryData)

                if (error) throw error
                showToast('Kategori berhasil ditambahkan', 'success')
            }

            closeModal()
            loadCategories()
        } catch (error: any) {
            console.error('Error saving category:', error)
            
            if (error.code === '23505') {
                showToast('Nama kategori sudah ada', 'error')
            } else {
                showToast('Gagal menyimpan kategori', 'error')
            }
        }
    }

    const handleDelete = async (categoryId: string, productCount: number) => {
        if (productCount > 0) {
            showToast(`Tidak dapat menghapus kategori yang memiliki ${productCount} produk`, 'error')
            return
        }

        if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId)

            if (error) throw error
            showToast('Kategori berhasil dihapus', 'success')
            loadCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            showToast('Gagal menghapus kategori', 'error')
        }
    }

    const handleSeedCategories = async () => {
        if (!confirm('Apakah Anda ingin mengimpor 24 kategori obat default untuk apotik?\n\nKategori yang sudah ada tidak akan digandakan.')) return

        setSeeding(true)
        try {
            const result = await seedPharmacyCategories()
            
            if (result.success) {
                showToast(result.message, 'success')
                await loadCategories()
            } else {
                showToast(result.message, 'error')
            }
        } catch (error) {
            console.error('Error seeding categories:', error)
            showToast('Gagal mengimpor kategori', 'error')
        } finally {
            setSeeding(false)
        }
    }

    const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div>
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kategori Produk</h1>
                        <p className="text-gray-600 mt-2">Kelola kategori untuk mengorganisir produk</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSeedCategories}
                            disabled={seeding}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            {seeding ? 'Mengimpor...' : 'Import Kategori Default'}
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah Kategori
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Kategori</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
                            </div>
                            <Tag className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Produk</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
                            </div>
                            <Package className="h-12 w-12 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rata-rata Produk</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {categories.length > 0 ? Math.round(totalProducts / categories.length) : 0}
                                </p>
                            </div>
                            <Package className="h-12 w-12 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Belum ada kategori
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Mulai dengan menambahkan kategori pertama Anda
                        </p>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah Kategori
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Tag className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {category.product_count} produk
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {category.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => openModal(category)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id, category.product_count || 0)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Kategori
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: Obat Umum"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi (Opsional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Deskripsi kategori..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                                    >
                                        {editingCategory ? 'Update' : 'Tambah'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    )
}
