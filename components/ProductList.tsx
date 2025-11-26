'use client'

import { Product } from '@/types'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Paracetamol 500mg',
        description: 'Pain reliever and fever reducer',
        price: 5000,
        stock: 100,
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
    },
    {
        id: '2',
        name: 'Amoxicillin 500mg',
        description: 'Antibiotic for bacterial infections',
        price: 15000,
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop'
    },
    {
        id: '3',
        name: 'Vitamin C 1000mg',
        description: 'Immune system booster',
        price: 25000,
        stock: 200,
        image_url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop'
    },
    {
        id: '4',
        name: 'Ibuprofen 400mg',
        description: 'Anti-inflammatory pain relief',
        price: 8000,
        stock: 150,
        image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop'
    },
    {
        id: '5',
        name: 'Multivitamin Complex',
        description: 'Daily essential vitamins and minerals',
        price: 35000,
        stock: 80,
        image_url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=400&fit=crop'
    },
    {
        id: '6',
        name: 'Cetirizine 10mg',
        description: 'Allergy relief medication',
        price: 12000,
        stock: 120,
        image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop'
    }
]

export default function ProductList() {
    const [products] = useState<Product[]>(MOCK_PRODUCTS)
    const { addToCart } = useCart()
    const { showToast } = useToast()

    const handleAddToCart = (product: Product) => {
        addToCart(product)
        showToast(`${product.name} added to cart!`)
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
