'use client'

import { Product } from '@/types'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, X, ChevronDown } from 'lucide-react'

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const supabase = createClient()

    const categories = [
        { id: 'all', name: 'Semua Kategori', count: 0 },
        { id: 'obat-umum', name: 'Obat Umum', count: 0 },
        { id: 'obat-keras', name: 'Obat Keras', count: 0 },
        { id: 'vitamin', name: 'Vitamin & Suplemen', count: 0 },
        { id: 'alat-kesehatan', name: 'Alat Kesehatan', count: 0 },
        { id: 'perawatan', name: 'Perawatan Tubuh', count: 0 },
    ]

    useEffect(() => {
        loadProducts()
    }, [])

    useEffect(() => {
        filterProducts()
    }, [products, searchQuery, selectedCategory, priceRange])

    async function loadProducts() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .gt('stock', 0) // Only show products in stock
                .order('name')

            if (error) throw error
            setProducts(data || [])
            setFilteredProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
            showToast('Gagal memuat produk', 'error')
        } finally {
            setLoading(false)
        }
    }

    function filterProducts() {
        let filtered = [...products]

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.description?.toLowerCase().includes(selectedCategory.replace('-', ' '))
            )
        }

        // Filter by price range
        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        )

        setFilteredProducts(filtered)
    }

    function resetFilters() {
        setSearchQuery('')
        setSelectedCategory('all')
        setPriceRange([0, 1000000])
    }

    const handleAddToCart = (product: Product) => {
        addToCart(product)
        showToast(`${product.name} added to cart!`)
    }

    if (loading) {
        return (
            <div className="bg-transparent">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat produk...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="h-5 w-5" />
                        <span className="font-medium">Filter & Pencarian</span>
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Left Sidebar - Filters */}
                    <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 space-y-6">
                            {/* Filter Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Filter className="h-5 w-5 text-blue-600" />
                                    Filter Produk
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Kategori</h4>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                                                selectedCategory === category.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="text-sm font-medium">{category.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Range Harga</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Harga Minimum</label>
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Rp 0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Harga Maksimum</label>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Rp 1.000.000"
                                        />
                                    </div>
                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-600">
                                            Rp {priceRange[0].toLocaleString()} - Rp {priceRange[1].toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(selectedCategory !== 'all' || searchQuery || priceRange[0] > 0 || priceRange[1] < 1000000) && (
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Filter Aktif:</p>
                                    <div className="space-y-1">
                                        {selectedCategory !== 'all' && (
                                            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                {categories.find(c => c.id === selectedCategory)?.name}
                                            </div>
                                        )}
                                        {searchQuery && (
                                            <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                                Pencarian: "{searchQuery}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari produk obat, vitamin, atau alat kesehatan..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Menampilkan <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produk
                            </p>
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <Search className="h-16 w-16 mx-auto" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h3>
                                <p className="text-gray-600 mb-4">Coba ubah filter atau kata kunci pencarian</p>
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                                    >
                                        <div className="aspect-square w-full overflow-hidden bg-gray-100">
                                            <img
                                                src={product.image_url || 'https://via.placeholder.com/300'}
                                                alt={product.name}
                                                className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xl font-bold text-blue-600">Rp {product.price.toLocaleString()}</p>
                                                <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    Stok: {product.stock}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleAddToCart(product)
                                                }}
                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            >
                                                Tambah ke Keranjang
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
