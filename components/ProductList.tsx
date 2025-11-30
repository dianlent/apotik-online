'use client'

import { Product } from '@/types'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        loadProducts()
    }, [])

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
        } catch (error) {
            console.error('Error loading products:', error)
            showToast('Gagal memuat produk', 'error')
        } finally {
            setLoading(false)
        }
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

    if (products.length === 0) {
        return (
            <div className="bg-transparent">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Belum ada produk tersedia</p>
                        <p className="text-gray-500 text-sm mt-2">Silakan tambahkan produk melalui Admin Dashboard</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-transparent">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                            <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-t-2xl">
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
                                        {product.stock} in stock
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleAddToCart(product)
                                    }}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
