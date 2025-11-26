'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Product } from '@/types'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface Category {
    id: string
    name: string
    description: string | null
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        barcode: '',
        category_id: ''
    })
    const [uploading, setUploading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')
    const [barcodeExists, setBarcodeExists] = useState(false)
    const [checkingBarcode, setCheckingBarcode] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadProducts()
        loadCategories()
    }, [])

    async function loadProducts() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name')

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
            showToast('Gagal memuat produk', 'error')
        } finally {
            setLoading(false)
        }
    }

    async function loadCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                stock: product.stock.toString(),
                image_url: product.image_url || '',
                barcode: product.barcode || '',
                category_id: (product as any).category_id || ''
            })
        } else {
            setEditingProduct(null)
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                image_url: '',
                barcode: '',
                category_id: ''
            })
        }
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingProduct(null)
        setImageFile(null)
        setImagePreview('')
        setBarcodeExists(false)
        setCheckingBarcode(false)
    }

    const checkBarcodeExists = async (barcode: string) => {
        if (!barcode) {
            setBarcodeExists(false)
            return
        }

        setCheckingBarcode(true)
        try {
            const { data: existingProduct } = await supabase
                .from('products')
                .select('id')
                .eq('barcode', barcode)
                .single()

            // Check if barcode exists and it's not the current product
            setBarcodeExists(!!existingProduct && existingProduct.id !== editingProduct?.id)
        } catch (error) {
            // No product found with this barcode (which is good)
            setBarcodeExists(false)
        } finally {
            setCheckingBarcode(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `products/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            return data.publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            showToast('Gagal upload gambar', 'error')
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // Validate barcode uniqueness if provided
            if (formData.barcode) {
                const { data: existingProduct } = await supabase
                    .from('products')
                    .select('id')
                    .eq('barcode', formData.barcode)
                    .single()

                // If barcode exists and it's not the current product being edited
                if (existingProduct && existingProduct.id !== editingProduct?.id) {
                    showToast('Barcode sudah digunakan oleh produk lain', 'error')
                    return
                }
            }

            let imageUrl = formData.image_url

            // Upload image if file is selected
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile)
                if (uploadedUrl) {
                    imageUrl = uploadedUrl
                }
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                image_url: imageUrl || null,
                barcode: formData.barcode || null,
                category_id: formData.category_id || null
            }

            if (editingProduct) {
                // Update existing product
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)

                if (error) throw error
                showToast('Produk berhasil diupdate', 'success')
            } else {
                // Create new product
                const { error } = await supabase
                    .from('products')
                    .insert(productData)

                if (error) throw error
                showToast('Produk berhasil ditambahkan', 'success')
            }

            closeModal()
            loadProducts()
        } catch (error: any) {
            console.error('Error saving product:', error)
            
            // Handle specific errors
            if (error.code === '23505') {
                if (error.message.includes('barcode')) {
                    showToast('Barcode sudah digunakan oleh produk lain', 'error')
                } else {
                    showToast('Data sudah ada di database', 'error')
                }
            } else {
                showToast('Gagal menyimpan produk', 'error')
            }
        }
    }

    const handleDelete = async (productId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) throw error
            showToast('Produk berhasil dihapus', 'success')
            loadProducts()
        } catch (error) {
            console.error('Error deleting product:', error)
            showToast('Gagal menghapus produk', 'error')
        }
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div>
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
                        <p className="text-gray-600 mt-2">Tambah, edit, atau hapus produk</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Tambah Produk
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Products Table */}
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
                                            Produk
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Harga
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stok
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                            src={product.image_url || 'https://via.placeholder.com/40'}
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.description}
                                                        </div>
                                                    </div>
                                                </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        Rp {product.price.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        product.stock > 10
                                                            ? 'bg-green-100 text-green-800'
                                                            : product.stock > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.stock}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(product)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Produk
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stok
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori
                                    </label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Pilih Kategori (Opsional)</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gambar Produk
                                    </label>
                                    
                                    {/* Image Preview */}
                                    {(imagePreview || formData.image_url) && (
                                        <div className="mb-3">
                                            <img
                                                src={imagePreview || formData.image_url}
                                                alt="Preview"
                                                className="rounded border border-gray-300 object-cover"
                                                style={{ width: '80px', height: '50px' }}
                                            />
                                        </div>
                                    )}

                                    {/* File Upload */}
                                    <div className="mb-3">
                                        <label className="block">
                                            <span className="sr-only">Pilih gambar</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-lg file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100
                                                    cursor-pointer"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Upload gambar produk (JPG, PNG, max 5MB)
                                        </p>
                                    </div>

                                    {/* Or URL Input */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-white text-gray-500">atau masukkan URL</span>
                                        </div>
                                    </div>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Barcode
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.barcode}
                                            onChange={(e) => {
                                                setFormData({ ...formData, barcode: e.target.value })
                                                checkBarcodeExists(e.target.value)
                                            }}
                                            placeholder="Contoh: 8992761123456"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono ${
                                                barcodeExists 
                                                    ? 'border-red-300 focus:ring-red-500' 
                                                    : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                        />
                                        {checkingBarcode && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            </div>
                                        )}
                                    </div>
                                    {barcodeExists ? (
                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                            <span>⚠️</span>
                                            Barcode sudah digunakan oleh produk lain
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Opsional - Untuk scan barcode di kasir
                                        </p>
                                    )}
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
                                    disabled={uploading || barcodeExists}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Uploading...
                                        </>
                                    ) : barcodeExists ? (
                                        'Barcode Sudah Ada'
                                    ) : (
                                        editingProduct ? 'Update' : 'Tambah'
                                    )}
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
