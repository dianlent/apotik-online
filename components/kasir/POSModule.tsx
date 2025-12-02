'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, CartItem } from '@/types'
import { Search, Scan, Trash2, Plus, Minus, ShoppingCart, Printer, X, Home, LayoutDashboard, User } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'
import BarcodeScanner from './BarcodeScanner'

interface Category {
    id: string
    name: string
}

export default function POSModule() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
    const [userName, setUserName] = useState<string>('')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris' | 'transfer'>('cash')
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
    const [discountValue, setDiscountValue] = useState('0')
    const [taxRate, setTaxRate] = useState(11) // Default 11% PPN
    const [cashReceived, setCashReceived] = useState('0')
    const [qrisData, setQrisData] = useState<{ qr_string: string; checkout_url: string } | null>(null)
    const [loadingQris, setLoadingQris] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()
    const router = useRouter()

    useEffect(() => {
        loadCategories()
        loadProducts()
        loadUserInfo()
    }, [])

    async function loadCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    async function loadUserInfo() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()
                
                setUserName(profile?.full_name || user.email || 'Kasir')
            }
        } catch (error) {
            console.error('Error loading user info:', error)
        }
    }

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

    const handleBarcodeScanned = async (barcode: string) => {
        try {
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
        showToast(`${product.name} ditambahkan`, 'success')
    }

    const updateQuantity = (productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        if (newQuantity > product.stock) {
            showToast('Stok tidak mencukupi', 'error')
            return
        }

        if (newQuantity < 1) {
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

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal()
        const value = parseFloat(discountValue) || 0
        if (value === 0) return 0
        
        if (discountType === 'percentage') {
            return subtotal * (value / 100)
        } else {
            return value
        }
    }

    const calculateTax = () => {
        const subtotal = calculateSubtotal()
        const discount = calculateDiscount()
        return (subtotal - discount) * (taxRate / 100)
    }

    const calculateTotal = () => {
        const subtotal = calculateSubtotal()
        const discount = calculateDiscount()
        const tax = calculateTax()
        return subtotal - discount + tax
    }

    const calculateChange = () => {
        const received = parseFloat(cashReceived) || 0
        if (received === 0) return 0
        return received - calculateTotal()
    }

    const generateQRIS = async () => {
        setLoadingQris(true)
        try {
            // Generate order ID
            const orderId = `POS-${Date.now()}`

            // Get user email
            const { data: { user } } = await supabase.auth.getUser()
            const userEmail = user?.email || 'kasir@apotik.com'

            console.log('Generating QRIS with data:', {
                orderId,
                amount: Math.round(calculateTotal()),
                customerName: userName || 'Customer',
                customerEmail: userEmail,
                productDetails: `Pembelian ${cart.length} item`
            })

            // Call server-side API to create QRIS
            const response = await fetch('/api/payment/qris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId,
                    amount: Math.round(calculateTotal()),
                    customerName: userName || 'Customer',
                    customerEmail: userEmail,
                    productDetails: `Pembelian ${cart.length} item`
                })
            })

            console.log('QRIS API Response status:', response.status)
            
            if (!response.ok) {
                const errorText = await response.text()
                console.error('QRIS API Error:', errorText)
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }

            const result = await response.json()
            console.log('QRIS API Result:', result)

            if (result.success && result.data) {
                setQrisData({
                    qr_string: result.data.qr_string || '',
                    checkout_url: result.data.checkout_url || ''
                })
                showToast('QRIS berhasil dibuat!', 'success')
            } else {
                const errorMsg = result.error || result.message || 'Gagal membuat QRIS'
                console.error('QRIS generation failed:', errorMsg)
                showToast(errorMsg, 'error')
            }
        } catch (error) {
            console.error('Error generating QRIS:', error)
            const errorMsg = error instanceof Error ? error.message : 'Gagal membuat QRIS. Periksa konfigurasi Duitku di Settings.'
            showToast(errorMsg, 'error')
        } finally {
            setLoadingQris(false)
        }
    }

    const processTransaction = async () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong', 'error')
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
                    shipping_cost: 0,
                    status: paymentMethod === 'qris' ? 'pending' : 'paid',
                    payment_method: paymentMethod,
                    payment_reference: qrisData?.checkout_url.split('/').pop() || null,
                    payment_status: paymentMethod === 'qris' ? 'pending' : 'success'
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

            // Update stock
            for (const item of cart) {
                const { error: stockError } = await supabase
                    .from('products')
                    .update({ stock: item.stock - item.quantity })
                    .eq('id', item.id)

                if (stockError) throw stockError
            }

            showToast('Transaksi berhasil!', 'success')
            
            // Print receipt
            printReceipt(order.id)
            
            // Clear cart and reload products
            setCart([])
            setShowPaymentModal(false)
            setQrisData(null)
            setCashReceived('0')
            setDiscountValue('0')
            loadProducts()
        } catch (error) {
            console.error('Error processing transaction:', error)
            showToast(`Gagal memproses transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
        } finally {
            setProcessing(false)
        }
    }

    const printReceipt = (orderId: string) => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${orderId}</title>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>APOTIK POS</h2>
                    <p>Order ID: ${orderId}</p>
                    <p>${new Date().toLocaleString('id-ID')}</p>
                </div>
                ${cart.map(item => `
                    <div class="item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>Rp ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `).join('')}
                <div class="total">
                    <div class="item">
                        <span>TOTAL</span>
                        <span>Rp ${calculateTotal().toLocaleString()}</span>
                    </div>
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `

        printWindow.document.write(receiptHTML)
        printWindow.document.close()
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'ALL' || product.category_id === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Side - Products */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation Bar */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Home className="h-5 w-5" />
                            <span className="font-medium">Home</span>
                        </button>
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            <span className="font-medium">Dashboard</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                            <User className="h-5 w-5" />
                            <div className="text-right">
                                <p className="text-sm font-medium">{userName}</p>
                                <p className="text-xs text-blue-100">Kasir</p>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{new Date().toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center gap-4 mb-4">
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
                        <button
                            onClick={() => setShowBarcodeScanner(true)}
                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md flex items-center gap-2"
                        >
                            <Scan className="h-5 w-5" />
                            Scan
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory('ALL')}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === 'ALL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Semua Produk
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                    selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center"
                                    disabled={product.stock < 1}
                                >
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/100'}
                                        alt={product.name}
                                        className="w-20 h-20 object-cover rounded-lg mb-2"
                                    />
                                    <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-blue-600 font-bold text-sm">
                                        Rp {product.price.toLocaleString()}
                                    </p>
                                    <span className={`text-xs mt-1 ${
                                        product.stock > 10 ? 'text-green-600' : 
                                        product.stock > 0 ? 'text-yellow-600' : 
                                        'text-red-600'
                                    }`}>
                                        Stok: {product.stock}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Cart */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                {/* Cart Header */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6" />
                        Keranjang ({cart.length})
                    </h2>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingCart className="h-16 w-16 mb-4" />
                            <p>Keranjang kosong</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm text-gray-900">
                                                {item.name}
                                            </h3>
                                            <p className="text-blue-600 font-bold text-sm">
                                                Rp {item.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-12 text-center font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="font-bold text-gray-900">
                                            Rp {(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                    <div className="p-4 border-t border-gray-200 space-y-3">
                        {/* Discount Input */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Diskon</label>
                            <div className="flex gap-2">
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                    <option value="percentage">%</option>
                                    <option value="fixed">Rp</option>
                                </select>
                                <input
                                    type="number"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    placeholder="0"
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>
                        </div>

                        {/* Calculation Summary */}
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span>Rp {calculateSubtotal().toLocaleString()}</span>
                            </div>
                            {parseFloat(discountValue) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Diskon ({discountType === 'percentage' ? `${discountValue}%` : 'Rp'}):</span>
                                    <span>- Rp {calculateDiscount().toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Pajak (PPN {taxRate}%):</span>
                                <span>Rp {calculateTax().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-blue-600 pt-2 border-t border-gray-300">
                                <span>TOTAL:</span>
                                <span>Rp {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Printer className="h-6 w-6" />
                            Proses Pembayaran
                        </button>
                    </div>
                )}
            </div>

            {/* Barcode Scanner Modal */}
            <BarcodeScanner
                isOpen={showBarcodeScanner}
                onClose={() => setShowBarcodeScanner(false)}
                onScan={handleBarcodeScanned}
            />

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pembayaran</h2>
                        
                        {/* Payment Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">Rp {calculateSubtotal().toLocaleString()}</span>
                            </div>
                            {parseFloat(discountValue) > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Diskon:</span>
                                    <span>- Rp {calculateDiscount().toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Pajak ({taxRate}%):</span>
                                <span className="font-semibold">Rp {calculateTax().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t border-gray-300">
                                <span>TOTAL:</span>
                                <span>Rp {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'cash'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="font-semibold">💵 Tunai</div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'card'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="font-semibold">💳 Kartu</div>
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentMethod('qris')
                                        if (!qrisData) {
                                            generateQRIS()
                                        }
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'qris'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="font-semibold">📱 QRIS</div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'transfer'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="font-semibold">🏦 Transfer</div>
                                </button>
                            </div>
                        </div>

                        {/* Cash Payment Input */}
                        {paymentMethod === 'cash' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Uang Diterima</label>
                                <input
                                    type="number"
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    placeholder="Masukkan jumlah uang"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                />
                                {parseFloat(cashReceived) > 0 && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Kembalian:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                Rp {calculateChange().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* QRIS Payment */}
                        {paymentMethod === 'qris' && (
                            <div className="mb-4">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                                    <div className="text-center mb-4">
                                        <p className="text-lg font-semibold text-gray-900 mb-1">Pembayaran QRIS</p>
                                        <p className="text-sm text-gray-600">Scan dengan aplikasi e-wallet atau mobile banking</p>
                                    </div>
                                    
                                    {loadingQris ? (
                                        <div className="w-56 h-56 mx-auto bg-white rounded-lg flex items-center justify-center shadow-md">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                                <p className="text-sm text-gray-600 font-medium">Membuat QRIS...</p>
                                                <p className="text-xs text-gray-500 mt-1">Mohon tunggu sebentar</p>
                                            </div>
                                        </div>
                                    ) : qrisData && qrisData.qr_string ? (
                                        <div className="space-y-4">
                                            <div className="bg-white p-4 inline-block rounded-lg border-2 border-green-300 shadow-lg mx-auto">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrisData.qr_string)}`}
                                                    alt="QRIS Code"
                                                    className="w-48 h-48 mx-auto"
                                                    onError={(e) => {
                                                        console.error('QR Code image failed to load')
                                                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280">QR Error</text></svg>'
                                                    }}
                                                />
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                <p className="text-sm text-green-700 font-medium text-center">
                                                    ✓ QRIS berhasil dibuat!
                                                </p>
                                            </div>
                                            {qrisData.checkout_url && (
                                                <div className="text-center">
                                                    <a
                                                        href={qrisData.checkout_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        <span>🔗</span>
                                                        Buka Halaman Pembayaran
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-56 h-56 mx-auto bg-white rounded-lg flex items-center justify-center shadow-md border-2 border-dashed border-gray-300">
                                            <div className="text-center p-4">
                                                <div className="text-6xl mb-3">📱</div>
                                                <p className="text-sm text-gray-600 mb-3">Belum ada QRIS</p>
                                                <button
                                                    onClick={generateQRIS}
                                                    disabled={loadingQris}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium disabled:opacity-50"
                                                >
                                                    Generate QRIS
                                                </button>
                                                <p className="text-xs text-gray-500 mt-3">
                                                    Klik untuk membuat kode QRIS
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total Pembayaran:</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                Rp {calculateTotal().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {qrisData && (
                                        <button
                                            onClick={() => {
                                                setQrisData(null)
                                                generateQRIS()
                                            }}
                                            className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            🔄 Generate Ulang QRIS
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Card Payment */}
                        {paymentMethod === 'card' && (
                            <div className="mb-4">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                                    <div className="text-6xl mb-4">💳</div>
                                    <p className="text-lg font-semibold text-gray-900 mb-2">Pembayaran Kartu</p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Gesek atau tap kartu Anda pada mesin EDC
                                    </p>
                                    <div className="bg-white p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            Rp {calculateTotal().toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Mendukung: Debit, Credit, Visa, Mastercard
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Bank Transfer */}
                        {paymentMethod === 'transfer' && (
                            <div className="mb-4">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
                                    <div className="text-center mb-4">
                                        <div className="text-6xl mb-2">🏦</div>
                                        <p className="text-lg font-semibold text-gray-900">Transfer Bank</p>
                                    </div>
                                    <div className="space-y-3 bg-white p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Bank:</span>
                                            <span className="font-semibold">BCA</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">No. Rekening:</span>
                                            <span className="font-mono font-semibold">1234567890</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Atas Nama:</span>
                                            <span className="font-semibold">APOTIK POS</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Jumlah Transfer:</span>
                                                <span className="text-xl font-bold text-green-600">
                                                    Rp {calculateTotal().toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        Konfirmasi pembayaran setelah transfer berhasil
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false)
                                    setCashReceived('')
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={processTransaction}
                                disabled={processing || (paymentMethod === 'cash' && calculateChange() < 0)}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Printer className="h-5 w-5" />
                                        Bayar & Print
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
