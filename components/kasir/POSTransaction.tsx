'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, CartItem } from '@/types'
import { Search, Plus, Minus, Trash2, ShoppingCart, X, Scan } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import BarcodeScanner from './BarcodeScanner'

interface POSTransactionProps {
    onTransactionComplete?: () => void
}

export default function POSTransaction({ onTransactionComplete }: POSTransactionProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleBarcodeScanned = async (barcode: string) => {
        try {
            // Find product by barcode
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('barcode', barcode)
                .single()

            if (error || !product) {
                showToast('Produk tidak ditemukan', 'error')
                return
            }

            addToCart(product)
        } catch (error) {
            console.error('Error finding product by barcode:', error)
            showToast('Gagal memindai barcode', 'error')
        }
    }

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.id === product.id)
        
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                showToast('Stok tidak mencukupi', 'error')
                return
            }
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            if (product.stock < 1) {
                showToast('Stok habis', 'error')
                return
            }
            setCart([...cart, { ...product, quantity: 1 }])
        }
        showToast(`${product.name} ditambahkan ke keranjang`)
    }

    const updateQuantity = (productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        if (newQuantity > product.stock) {
            showToast('Stok tidak mencukupi', 'error')
            return
        }

        if (newQuantity <= 0) {
            removeFromCart(productId)
            return
        }

        setCart(cart.map(item =>
            item.id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ))
    }

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId))
    }

    const clearCart = () => {
        setCart([])
    }

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    const processTransaction = async () => {
        if (cart.length === 0) {
            showToast('Keranjang kosong', 'error')
            return
        }

        setProcessing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const total = calculateTotal()

            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total,
                    shipping_cost: 0,
                    status: 'paid'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // Update product stock
            for (const item of cart) {
                const { error: stockError } = await supabase
                    .from('products')
                    .update({ stock: item.stock - item.quantity })
                    .eq('id', item.id)

                if (stockError) throw stockError
            }

            showToast('Transaksi berhasil!', 'success')
            clearCart()
            loadProducts() // Reload products to update stock
            if (onTransactionComplete) {
                onTransactionComplete()
            }
        } catch (error) {
            console.error('Error processing transaction:', error)
            showToast('Gagal memproses transaksi', 'error')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Products List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Daftar Produk</h2>
                                <button
                                    onClick={() => setShowBarcodeScanner(true)}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    <Scan className="h-5 w-5 mr-2" />
                                    Scan Barcode
                                </button>
                            </div>
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

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-lg font-bold text-blue-600">
                                            Rp {product.price.toLocaleString()}
                                        </span>
                                        <span className={`text-sm px-2 py-1 rounded ${
                                            product.stock > 10 
                                                ? 'bg-green-100 text-green-700' 
                                                : product.stock > 0 
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            Stok: {product.stock}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Keranjang
                        </h2>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                                Hapus Semua
                            </button>
                        )}
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Keranjang kosong</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                                                <p className="text-sm text-blue-600 font-semibold">
                                                    Rp {item.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <span className="font-semibold text-gray-900">
                                                Rp {(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <div className="flex items-center justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-blue-600">Rp {calculateTotal().toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={processTransaction}
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Memproses...' : 'Proses Transaksi'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Barcode Scanner Modal */}
        <BarcodeScanner
            isOpen={showBarcodeScanner}
            onClose={() => setShowBarcodeScanner(false)}
            onScan={handleBarcodeScanned}
        />
    </>
    )
}
