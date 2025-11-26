export interface Product {
    id: string
    name: string
    description: string
    price: number
    stock: number
    image_url?: string
    barcode?: string
}

export interface CartItem extends Product {
    quantity: number
}

export type UserRole = 'admin' | 'apoteker' | 'kasir' | 'customer'

export interface Profile {
    id: string
    role: UserRole
    full_name: string | null
    created_at: string
}

export interface User {
    id: string
    email: string
    profile?: Profile
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface Order {
    id: string
    user_id: string
    total: number
    shipping_cost: number
    status: OrderStatus
    created_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    price: number
    created_at: string
    product?: Product
}
