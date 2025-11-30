'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Product } from '@/types'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import JsBarcode from 'jsbarcode'

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
    const [barcodeError, setBarcodeError] = useState('')
    const [barcodeType, setBarcodeType] = useState<'EAN13' | 'UPC'>('EAN13')
    const barcodeCanvasRef = useRef<HTMLCanvasElement>(null)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadProducts()
        loadCategories()
    }, [])

    // Generate barcode image when barcode changes and is valid
    useEffect(() => {
        if (formData.barcode && validateBarcode(formData.barcode, barcodeType) && !barcodeError && !barcodeExists) {
            // Small delay to ensure canvas is rendered
            setTimeout(() => {
                generateBarcodeImage(formData.barcode, barcodeType)
            }, 100)
        }
    }, [formData.barcode, barcodeError, barcodeExists, barcodeType])

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
        setBarcodeError('')
    }

    // Validate barcode based on type
    const validateBarcode = (barcode: string, type: 'EAN13' | 'UPC'): boolean => {
        if (!barcode) return true // Empty is valid (optional field)
        
        if (type === 'EAN13') {
            return validateEAN13(barcode)
        } else {
            return validateUPC(barcode)
        }
    }

    // Validate EAN13 barcode
    const validateEAN13 = (barcode: string): boolean => {
        if (!barcode) return true
        
        // EAN13 must be exactly 13 digits
        if (!/^\d{13}$/.test(barcode)) {
            return false
        }

        // Calculate checksum
        const digits = barcode.split('').map(Number)
        const checkDigit = digits[12]
        
        let sum = 0
        for (let i = 0; i < 12; i++) {
            sum += digits[i] * (i % 2 === 0 ? 1 : 3)
        }
        
        const calculatedCheck = (10 - (sum % 10)) % 10
        return checkDigit === calculatedCheck
    }

    // Validate UPC barcode
    const validateUPC = (barcode: string): boolean => {
        if (!barcode) return true
        
        // UPC must be exactly 12 digits
        if (!/^\d{12}$/.test(barcode)) {
            return false
        }

        // Calculate checksum
        const digits = barcode.split('').map(Number)
        const checkDigit = digits[11]
        
        let sum = 0
        for (let i = 0; i < 11; i++) {
            sum += digits[i] * (i % 2 === 0 ? 3 : 1)
        }
        
        const calculatedCheck = (10 - (sum % 10)) % 10
        return checkDigit === calculatedCheck
    }

    // Generate random EAN13 barcode
    const generateEAN13 = (): string => {
        // Use country code 899 (for free assignment)
        let barcode = '899'
        
        // Add 9 random digits
        for (let i = 0; i < 9; i++) {
            barcode += Math.floor(Math.random() * 10)
        }
        
        // Calculate check digit
        const digits = barcode.split('').map(Number)
        let sum = 0
        for (let i = 0; i < 12; i++) {
            sum += digits[i] * (i % 2 === 0 ? 1 : 3)
        }
        const checkDigit = (10 - (sum % 10)) % 10
        
        return barcode + checkDigit
    }

    // Generate random UPC barcode
    const generateUPC = (): string => {
        // Generate 11 random digits
        let barcode = ''
        for (let i = 0; i < 11; i++) {
            barcode += Math.floor(Math.random() * 10)
        }
        
        // Calculate check digit
        const digits = barcode.split('').map(Number)
        let sum = 0
        for (let i = 0; i < 11; i++) {
            sum += digits[i] * (i % 2 === 0 ? 3 : 1)
        }
        const checkDigit = (10 - (sum % 10)) % 10
        
        return barcode + checkDigit
    }

    // Generate barcode image
    const generateBarcodeImage = (barcode: string, type: 'EAN13' | 'UPC' = 'EAN13') => {
        if (!barcode || !barcodeCanvasRef.current) return
        
        try {
            JsBarcode(barcodeCanvasRef.current, barcode, {
                format: type === 'EAN13' ? 'EAN13' : 'UPC',
                width: 2,
                height: 80,
                displayValue: true,
                fontSize: 14,
                margin: 10
            })
        } catch (error) {
            console.error('Error generating barcode image:', error)
        }
    }

    // Download barcode as image
    const downloadBarcode = () => {
        if (!barcodeCanvasRef.current) return
        
        const link = document.createElement('a')
        link.download = `barcode-${formData.barcode}.png`
        link.href = barcodeCanvasRef.current.toDataURL()
        link.click()
        showToast('Barcode berhasil didownload', 'success')
    }

    const checkBarcodeExists = async (barcode: string) => {
        if (!barcode) {
            setBarcodeExists(false)
            setBarcodeError('')
            return
        }

        // Validate barcode format based on type
        const isValid = validateBarcode(barcode, barcodeType)
        const expectedLength = barcodeType === 'EAN13' ? 13 : 12
        
        if (!isValid) {
            setBarcodeError(`Barcode harus format ${barcodeType} (${expectedLength} digit dengan checksum valid)`)
            setBarcodeExists(false)
            return
        } else {
            setBarcodeError('')
            // Generate barcode image if valid
            generateBarcodeImage(barcode, barcodeType)
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
            // Validate barcode format and uniqueness if provided
            if (formData.barcode) {
                // Validate barcode format based on type
                if (!validateBarcode(formData.barcode, barcodeType)) {
                    const expectedLength = barcodeType === 'EAN13' ? 13 : 12
                    showToast(`Barcode harus format ${barcodeType} yang valid (${expectedLength} digit)`, 'error')
                    return
                }

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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Barcode
                                    </label>
                                    
                                    {/* Barcode Type Selection */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Pilih Jenis Barcode
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBarcodeType('EAN13')
                                                    setFormData({ ...formData, barcode: '' })
                                                    setBarcodeError('')
                                                    setBarcodeExists(false)
                                                }}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                    barcodeType === 'EAN13'
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                EAN13 (13 digit)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBarcodeType('UPC')
                                                    setFormData({ ...formData, barcode: '' })
                                                    setBarcodeError('')
                                                    setBarcodeExists(false)
                                                }}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                    barcodeType === 'UPC'
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                UPC (12 digit)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Barcode Input */}
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={formData.barcode}
                                                onChange={(e) => {
                                                    const maxLength = barcodeType === 'EAN13' ? 13 : 12
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, maxLength)
                                                    setFormData({ ...formData, barcode: value })
                                                    checkBarcodeExists(value)
                                                }}
                                                placeholder={barcodeType === 'EAN13' ? '8992761123456' : '012345678912'}
                                                maxLength={barcodeType === 'EAN13' ? 13 : 12}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-lg tracking-wider ${
                                                    barcodeError || barcodeExists
                                                        ? 'border-red-300 focus:ring-red-500' 
                                                        : formData.barcode && validateBarcode(formData.barcode, barcodeType)
                                                        ? 'border-green-300 focus:ring-green-500'
                                                        : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                            />
                                            {checkingBarcode && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newBarcode = barcodeType === 'EAN13' ? generateEAN13() : generateUPC()
                                                setFormData({ ...formData, barcode: newBarcode })
                                                checkBarcodeExists(newBarcode)
                                            }}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all whitespace-nowrap font-medium"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                    
                                    {/* Barcode Preview */}
                                    {formData.barcode && validateBarcode(formData.barcode, barcodeType) && !barcodeError && !barcodeExists && (
                                        <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                                    <canvas ref={barcodeCanvasRef}></canvas>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                        {barcodeType}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={downloadBarcode}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all text-sm font-medium flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {barcodeError ? (
                                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                            <span>⚠️</span>
                                            {barcodeError}
                                        </p>
                                    ) : barcodeExists ? (
                                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                            <span>⚠️</span>
                                            Barcode sudah digunakan oleh produk lain
                                        </p>
                                    ) : formData.barcode && validateBarcode(formData.barcode, barcodeType) ? (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                            <span>✓</span>
                                            Barcode {barcodeType} valid
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Format {barcodeType} ({barcodeType === 'EAN13' ? '13' : '12'} digit) - Opsional, klik Generate untuk otomatis
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
                                    disabled={uploading || barcodeExists || !!barcodeError}
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
