'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { Search, ShoppingCart, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

export default function ProdukPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const supabase = createClient()
    const { addToCart } = useCart()
    const { showToast } = useToast()

    const categories = ['ALL', 'Obat Umum', 'Obat Keras', 'Vitamin & Suplemen', 'Alat Kesehatan', 'Perawatan Tubuh']

    useEffect(() => {
        loadProducts()
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

    const handleAddToCart = (product: Product) => {
        if (product.stock < 1) {
            showToast('Stok habis', 'error')
            return
        }
        addToCart(product)
        showToast(`${product.name} ditambahkan ke keranjang`, 'success')
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'ALL' || product.description?.includes(selectedCategory)
        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-4">Produk Kami</h1>
                    <p className="text-xl text-blue-100">
                        Temukan berbagai produk kesehatan berkualitas
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filter */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Count */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                        Menampilkan <span className="font-semibold">{filteredProducts.length}</span> produk
                    </p>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat produk...</p>
                        </div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Tidak ada produk ditemukan
                        </h3>
                        <p className="text-gray-600">
                            Coba ubah filter atau kata kunci pencarian
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden group"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {product.stock < 1 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                                                Stok Habis
                                            </span>
                                        </div>
                                    )}
                                    {product.stock > 0 && product.stock <= 10 && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                Stok Terbatas
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                                        {product.name}
                                    </h3>
                                    
                                    {product.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                Rp {product.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${
                                                product.stock > 10 ? 'text-green-600' :
                                                product.stock > 0 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock < 1}
                                        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                            product.stock < 1
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        {product.stock < 1 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
