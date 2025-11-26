'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function Cart() {
    const { items, removeFromCart, updateQuantity, total } = useCart()

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                <p className="mt-4 text-gray-500">Looks like you haven't added any items yet.</p>
                <Link
                    href="/"
                    className="mt-8 inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
                >
                    Continue Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Shopping Cart</h2>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
                {items.map((item) => (
                    <li key={item.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-16 w-16">
                                    <img
                                        className="h-16 w-16 rounded object-cover"
                                        src={item.image_url || 'https://via.placeholder.com/150'}
                                        alt={item.name}
                                    />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-blue-600">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Rp {item.price.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border rounded-md">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-2 hover:bg-gray-100"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4 text-gray-500" />
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium text-gray-900">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-2 hover:bg-gray-100"
                                    >
                                        <Plus className="h-4 w-4 text-gray-500" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-600 hover:text-red-900 p-2"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>Rp {total.toLocaleString()}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                    <Link
                        href="/checkout"
                        className="flex justify-center items-center w-full rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        Checkout
                    </Link>
                </div>
            </div>
        </div>
    )
}
