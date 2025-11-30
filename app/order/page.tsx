'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Trash2, Package, CreditCard, Search, Filter } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import Image from 'next/image'
import QRCode from 'qrcode'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    image_url: string | null
    barcode: string | null
    category_id: string | null
}

interface CartItem extends Product {
    quantity: number
}

export default function OrderPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [userRole, setUserRole] = useState<string>('')
    const [userName, setUserName] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    useEffect(() => {
        checkAuth()
        loadProducts()
    }, [])

    useEffect(() => {
        filterProducts()
    }, [searchQuery, products])

    async function checkAuth() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                showToast('Silakan login terlebih dahulu', 'error')
                router.push('/login')
                return
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', user.id)
                .single()

            if (!profile) {
                showToast('Profile tidak ditemukan', 'error')
                router.push('/login')
                return
            }

            // Check if user is customer/member
            if (profile.role !== 'customer') {
                showToast('Halaman ini khusus untuk member', 'error')
                router.push('/')
                return
            }

            setUserRole(profile.role)
            setUserName(profile.full_name || '')
            setUserEmail(user.email || '')
        } catch (error) {
            console.error('Error checking auth:', error)
            router.push('/login')
        }
    }

    async function loadProducts() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .gt('stock', 0)
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
        if (!searchQuery.trim()) {
            setFilteredProducts(products)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.barcode?.toLowerCase().includes(query)
        )
        setFilteredProducts(filtered)
    }

    function addToCart(product: Product) {
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
            setCart([...cart, { ...product, quantity: 1 }])
        }
        showToast('Produk ditambahkan ke keranjang', 'success')
    }

    function updateQuantity(productId: string, newQuantity: number) {
        const product = products.find(p => p.id === productId)
        if (!product) return

        if (newQuantity <= 0) {
            removeFromCart(productId)
            return
        }

        if (newQuantity > product.stock) {
            showToast('Stok tidak mencukupi', 'error')
            return
        }

        setCart(cart.map(item =>
            item.id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ))
    }

    function removeFromCart(productId: string) {
        setCart(cart.filter(item => item.id !== productId))
        showToast('Produk dihapus dari keranjang', 'success')
    }

    function calculateTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong', 'error')
            return
        }

        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const total = calculateTotal()
            const orderId = `ORDER-${Date.now()}`
            const orderNumber = `#${Date.now().toString().slice(-8)}`

            // Prepare order data
            const orderData = {
                orderId,
                orderNumber,
                userId: user.id,
                userEmail: userEmail,
                userName: userName,
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                })),
                subtotal: total,
                tax: 0,
                shippingCost: 0,
                total: total,
                paymentMethod: 'qris',
                timestamp: new Date().toISOString()
            }

            // Send to order webhook (non-blocking)
            const webhookUrl = process.env.NEXT_PUBLIC_N8N_ORDER_WEBHOOK_URL
            if (webhookUrl) {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                }).catch(err => console.error('Webhook error:', err))
            }

            // Call internal order webhook API
            try {
                await fetch('/api/orders/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
            } catch (err) {
                console.error('Internal webhook error:', err)
            }

            // Create QRIS payment
            const response = await fetch('/api/payment/qris', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    orderId: orderId,
                    customerName: userName,
                    customerEmail: userEmail,
                    items: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                })
            })

            if (!response.ok) {
                const error = await response.json()
                console.error('QRIS API Error:', error)
                throw new Error(error.error || error.message || 'Gagal membuat pembayaran')
            }

            const responseData = await response.json()
            console.log('QRIS Response:', responseData)

            // Store order info in localStorage
            localStorage.setItem('lastOrderId', orderId)
            localStorage.setItem('lastOrderNumber', orderNumber)
            localStorage.setItem('lastOrderAmount', total.toString())

            // Check response structure
            if (!responseData) {
                throw new Error('Response kosong dari server')
            }

            // Handle nested data structure (e.g., {success: true, data: {...}})
            const data = responseData.data || responseData

            // Show QRIS - check multiple possible response formats
            const qrString = data.qrString || data.qr_string || data.qrcode || responseData.qrString
            const reference = data.reference || data.merchantOrderId || responseData.reference || orderId

            if (qrString) {
                // Generate QR code image from QRIS string
                try {
                    const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
                        width: 400,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    })
                    
                    // Store QR code image and reference
                    localStorage.setItem('qrisImage', qrCodeDataUrl)
                    localStorage.setItem('qrisReference', reference)
                    localStorage.setItem('qrisString', qrString)
                    
                    // Redirect to payment page
                    router.push(`/payment/qris?reference=${reference}`)
                } catch (qrError) {
                    console.error('Error generating QR code:', qrError)
                    throw new Error('Gagal membuat QR code. Silakan coba lagi.')
                }
            } else {
                console.error('QRIS data not found in response:', responseData)
                throw new Error(`QRIS tidak tersedia. Silakan periksa konfigurasi Duitku di Settings. Error: ${data.message || responseData.message || 'Unknown error'}`)
            }

        } catch (error: any) {
            console.error('Checkout error:', error)
            showToast(error.message || 'Gagal melakukan checkout', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat produk...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-responsive">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="h-8 w-8 text-blue-600" />
                        Pemesanan Online
                    </h1>
                    <p className="text-gray-600 mt-2">Pilih produk dan lakukan pemesanan dengan mudah</p>
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            👤 <strong>Member:</strong> {userName} ({userEmail})
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product List */}
                    <div className="lg:col-span-2">
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

                        {/* Products Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk tersedia'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Product Image */}
                                        <div className="relative h-48 bg-gray-100">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Package className="h-16 w-16 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                            {product.description && (
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                    {product.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-lg font-bold text-blue-600">
                                                    Rp {product.price.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Stok: {product.stock}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={product.stock === 0}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Tambah ke Keranjang
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-4">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                    Keranjang ({cart.length})
                                </h2>
                            </div>

                            <div className="p-6">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Keranjang kosong</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Cart Items */}
                                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                            {cart.map((item) => (
                                                <div key={item.id} className="border-b border-gray-200 pb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-medium text-gray-900 text-sm flex-1">
                                                            {item.name}
                                                        </h3>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-600 hover:text-red-700 ml-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-8 text-center font-medium">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
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

                                        {/* Total */}
                                        <div className="border-t border-gray-200 pt-4 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-semibold">
                                                    Rp {calculateTotal().toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-blue-600">
                                                    Rp {calculateTotal().toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Checkout Button */}
                                        <button
                                            onClick={handleCheckout}
                                            disabled={submitting}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="h-5 w-5" />
                                                    Checkout dengan QRIS
                                                </>
                                            )}
                                        </button>

                                        <p className="text-xs text-gray-500 text-center mt-3">
                                            Pembayaran menggunakan QRIS Duitku
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
