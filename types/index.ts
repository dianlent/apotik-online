export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    image_url?: string | null
    barcode?: string | null
    category_id?: string | null
    created_at?: string
}

export interface CartItem extends Product {
    quantity: number
}

export type UserRole = 'admin' | 'apoteker' | 'kasir' | 'customer' | 'vendor'

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
    order_number?: string | null
    user_id: string
    total: number
    shipping_cost: number
    status: OrderStatus
    payment_method?: string | null
    payment_status?: string | null
    shipping_address?: string | null
    shipping_name?: string | null
    shipping_phone?: string | null
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

export type StockOpnameStatus = 'draft' | 'in_progress' | 'completed'

export interface StockOpnameSession {
    id: string
    reference_code: string
    status: StockOpnameStatus
    notes?: string | null
    created_by?: string | null
    started_at: string
    completed_at?: string | null
    total_items?: number | null
    total_adjusted?: number | null
    total_difference?: number | null
    created_at?: string
    updated_at?: string
}

export interface StockOpnameItem {
    id: string
    session_id: string
    product_id: string
    system_stock: number
    counted_stock: number | null
    note?: string | null
    difference?: number | null
    created_at?: string
    product?: Product
}
