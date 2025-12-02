'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Product } from '@/types'
import { Search, Plus, Minus, Trash2, ShoppingCart, User, MapPin, Phone, Save, ArrowLeft } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartItem {
    product: Product
    quantity: number
}

export default function CreateOrderPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    
    // Customer Info
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')
    const [shippingCost, setShippingCost] = useState('15000')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris'>('cash')
    
    const supabase = createClient()
    const { showToast } = useToast()
    const router = useRouter()

    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .gt('stock', 0)
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

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.product.id === product.id)
        
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                showToast('Stok tidak mencukupi', 'error')
                return
            }
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart([...cart, { product, quantity: 1 }])
        }
        showToast('Produk ditambahkan', 'success')
    }

    const updateQuantity = (productId: string, newQuantity: number) => {
        const item = cart.find(i => i.product.id === productId)
        if (!item) return

        if (newQuantity <= 0) {
            removeFromCart(productId)
            return
        }

        if (newQuantity > item.product.stock) {
            showToast('Stok tidak mencukupi', 'error')
            return
        }

        setCart(cart.map(item =>
            item.product.id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ))
    }

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId))
    }

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    }

    const calculateTotal = () => {
        return calculateSubtotal() + parseInt(shippingCost || '0')
    }

    async function handleCreateOrder() {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong', 'error')
            return
        }

        if (!customerName || !customerPhone || !shippingAddress) {
            showToast('Mohon lengkapi data customer', 'error')
            return
        }

        setProcessing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total: calculateTotal(),
                    shipping_cost: parseInt(shippingCost || '0'),
                    status: paymentMethod === 'cash' ? 'paid' : 'pending',
                    payment_method: paymentMethod,
                    payment_status: paymentMethod === 'cash' ? 'success' : 'pending',
                    shipping_name: customerName,
                    shipping_phone: customerPhone,
                    shipping_address: shippingAddress
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.product.id,
                product_name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                subtotal: item.product.price * item.quantity
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // Update stock
            for (const item of cart) {
                const { error: stockError } = await supabase
                    .from('products')
                    .update({ stock: item.product.stock - item.quantity })
                    .eq('id', item.product.id)

                if (stockError) throw stockError
            }

            showToast('Order berhasil dibuat!', 'success')
            
            // Reset form
            setCart([])
            setCustomerName('')
            setCustomerPhone('')
            setShippingAddress('')
            setShippingCost('15000')
            
            // Redirect to orders page
            router.push('/admin/orders')
        } catch (error) {
            console.error('Error creating order:', error)
            showToast('Gagal membuat order', 'error')
        } finally {
            setProcessing(false)
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AuthGuard allowedRoles={['kasir', 'admin']}>
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/kasir"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke POS
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Buat Order Baru</h1>
                        <p className="text-gray-600 mt-2">Input pesanan customer secara manual</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Product List */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Search */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari produk atau barcode..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Produk</h2>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                                        {filteredProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Stok: {product.stock}
                                                        </p>
                                                        <p className="text-sm font-semibold text-blue-600 mt-1">
                                                            Rp {product.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart & Customer Info */}
                        <div className="space-y-4">
                            {/* Cart */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Keranjang ({cart.length})
                                    </h2>
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                                    {cart.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">Keranjang kosong</p>
                                    ) : (
                                        cart.map((item) => (
                                            <div key={item.product.id} className="border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {item.product.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-600">
                                                            Rp {item.product.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-sm font-medium w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        Rp {(item.product.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">Rp {calculateSubtotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ongkir</span>
                                        <input
                                            type="number"
                                            value={shippingCost}
                                            onChange={(e) => setShippingCost(e.target.value)}
                                            className="w-24 text-right px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-blue-600">Rp {calculateTotal().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Data Customer</h2>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Lengkap *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Nama customer"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            No. Telepon *
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Alamat Pengiriman *
                                        </label>
                                        <textarea
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            placeholder="Alamat lengkap customer"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Metode Pembayaran
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="transfer">Transfer Bank</option>
                                            <option value="qris">QRIS</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleCreateOrder}
                                disabled={processing || cart.length === 0}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Buat Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}
