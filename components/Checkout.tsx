'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Checkout() {
    const { items, total, clearCart } = useCart()
    const [shippingCost, setShippingCost] = useState(10000) // Default flat rate
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handlePayment = async () => {
        setLoading(true)
        try {
            // Create order ID
            const orderId = `ORDER-${Date.now()}`
            const orderNumber = `#${Date.now().toString().slice(-8)}`
            const finalTotal = total + shippingCost

            // Prepare order data for webhook
            const orderData = {
                orderId,
                orderNumber,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: total,
                shippingCost,
                total: finalTotal,
                customerName: 'Customer',
                customerEmail: 'customer@example.com',
                paymentMethod: 'qris',
                paymentStatus: 'pending',
                status: 'pending'
            }

            // Send order to N8N webhook (non-blocking)
            fetch('/api/orders/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            }).catch(err => console.error('Webhook notification failed:', err))

            // Call Duitku QRIS payment API
            const response = await fetch('/api/payment/qris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    amount: finalTotal,
                    customerName: 'Customer',
                    customerEmail: 'customer@example.com',
                    productDetails: `Order ${orderNumber}`
                })
            })

            const result = await response.json()

            if (result.success && result.data?.checkout_url) {
                // Redirect to Duitku payment page
                window.location.href = result.data.checkout_url
                clearCart()
            } else {
                alert(result.error || 'Payment failed. Please try again.')
            }
        } catch (error) {
            console.error('Payment failed', error)
            alert('Payment failed. Please check your settings.')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return <div>Your cart is empty</div>
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Checkout</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Order Summary</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            <ul className="border-b border-gray-200 pb-4 mb-4">
                                {items.map(item => (
                                    <li key={item.id} className="flex justify-between py-2">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-between py-2">
                                <span>Subtotal</span>
                                <span>Rp {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span>Shipping (Local)</span>
                                <span>Rp {shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold text-lg">
                                <span>Total</span>
                                <span>Rp {(total + shippingCost).toLocaleString()}</span>
                            </div>
                        </dd>
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </div>
                </dl>
            </div>
        </div>
    )
}
