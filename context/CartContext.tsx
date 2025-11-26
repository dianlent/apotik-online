'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { CartItem, Product } from '@/types'

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product) => void
    removeFromCart: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    const addToCart = (product: Product) => {
        setItems(current => {
            const existing = current.find(item => item.id === product.id)
            if (existing) {
                return current.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...current, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId: string) => {
        setItems(current => current.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return
        setItems(current =>
            current.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => setItems([])

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
