'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Product } from '@/types'
import { Search, AlertTriangle, TrendingUp, TrendingDown, Package, Plus, Minus } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all')
    const [showAdjustModal, setShowAdjustModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')
    const [adjustmentAmount, setAdjustmentAmount] = useState('')
    const [adjustmentNote, setAdjustmentNote] = useState('')
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('stock', { ascending: true })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
            showToast('Gagal memuat inventori', 'error')
        } finally {
            setLoading(false)
        }
    }

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Habis', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
        if (stock <= 10) return { label: 'Rendah', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
        return { label: 'Normal', color: 'bg-green-100 text-green-800', icon: Package }
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        
        if (filterStatus === 'low') return matchesSearch && product.stock > 0 && product.stock <= 10
        if (filterStatus === 'out') return matchesSearch && product.stock === 0
        return matchesSearch
    })

    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    }

    const openAdjustModal = (product: Product, type: 'add' | 'subtract') => {
        setSelectedProduct(product)
        setAdjustmentType(type)
        setAdjustmentAmount('')
        setAdjustmentNote('')
        setShowAdjustModal(true)
    }

    const handleStockAdjustment = async () => {
        if (!selectedProduct || !adjustmentAmount) return

        try {
            const amount = parseInt(adjustmentAmount)
            const newStock = adjustmentType === 'add' 
                ? selectedProduct.stock + amount 
                : selectedProduct.stock - amount

            if (newStock < 0) {
                showToast('Stok tidak boleh negatif', 'error')
                return
            }

            const { error } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', selectedProduct.id)

            if (error) throw error

            showToast(`Stok ${adjustmentType === 'add' ? 'ditambah' : 'dikurangi'} sebanyak ${amount}`, 'success')
            setShowAdjustModal(false)
            loadProducts()
        } catch (error) {
            console.error('Error adjusting stock:', error)
            showToast('Gagal menyesuaikan stok', 'error')
        }
    }

    return (
        <AuthGuard allowedRoles={['admin', 'apoteker']}>
            <div>
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-600 mt-2">Monitor dan kelola stok produk</p>
                    </div>
                    <Link
                        href="/admin/stock-opname"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-semibold"
                    >
                        <span>Kelola Stock Opname</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Produk</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <Package className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stok Rendah</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
                            </div>
                            <AlertTriangle className="h-12 w-12 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stok Habis</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
                            </div>
                            <AlertTriangle className="h-12 w-12 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Nilai Total</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    Rp {(stats.totalValue / 1000000).toFixed(1)}M
                                </p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilterStatus('low')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'low'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Stok Rendah
                            </button>
                            <button
                                onClick={() => setFilterStatus('out')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'out'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Habis
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
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
                                            Stok
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Harga
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nilai Stok
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map((product) => {
                                        const status = getStockStatus(product.stock)
                                        const StatusIcon = status.icon
                                        return (
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
                                                            {product.barcode && (
                                                                <div className="text-xs text-gray-500 font-mono">
                                                                    {product.barcode}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {product.stock}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        Rp {product.price.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-green-600">
                                                        Rp {(product.price * product.stock).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openAdjustModal(product, 'add')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Tambah stok"
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openAdjustModal(product, 'subtract')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Kurangi stok"
                                                        >
                                                            <Minus className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Adjustment Modal */}
                {showAdjustModal && selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {adjustmentType === 'add' ? 'Tambah' : 'Kurangi'} Stok
                            </h2>
                            
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Produk</p>
                                <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                                <p className="text-sm text-gray-600 mt-2">Stok Saat Ini</p>
                                <p className="text-2xl font-bold text-blue-600">{selectedProduct.stock}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={adjustmentAmount}
                                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan jumlah"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        value={adjustmentNote}
                                        onChange={(e) => setAdjustmentNote(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Alasan penyesuaian stok..."
                                    />
                                </div>

                                {adjustmentAmount && (
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Stok Baru</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {adjustmentType === 'add' 
                                                ? selectedProduct.stock + parseInt(adjustmentAmount)
                                                : selectedProduct.stock - parseInt(adjustmentAmount)
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAdjustModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleStockAdjustment}
                                    disabled={!adjustmentAmount}
                                    className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                        adjustmentType === 'add'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {adjustmentType === 'add' ? 'Tambah' : 'Kurangi'} Stok
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    )
}
