'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ShoppingCart, 
    Package, 
    Users, 
    Target,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface KPIData {
    // Revenue KPIs
    currentPeriodRevenue: number
    previousPeriodRevenue: number
    revenueGrowth: number
    
    // Order KPIs
    currentPeriodOrders: number
    previousPeriodOrders: number
    orderGrowth: number
    averageOrderValue: number
    previousAverageOrderValue: number
    
    // Product KPIs
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    inventoryTurnover: number
    
    // Customer KPIs
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    customerRetentionRate: number
    
    // Daily metrics
    todayRevenue: number
    todayOrders: number
    yesterdayRevenue: number
    yesterdayOrders: number
    
    // Target
    monthlyTarget: number
    targetAchievement: number
}

interface TopPerformer {
    name: string
    value: number
    change: number
}

export default function KPIPage() {
    const [loading, setLoading] = useState(true)
    const [kpiData, setKpiData] = useState<KPIData>({
        currentPeriodRevenue: 0,
        previousPeriodRevenue: 0,
        revenueGrowth: 0,
        currentPeriodOrders: 0,
        previousPeriodOrders: 0,
        orderGrowth: 0,
        averageOrderValue: 0,
        previousAverageOrderValue: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        inventoryTurnover: 0,
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        customerRetentionRate: 0,
        todayRevenue: 0,
        todayOrders: 0,
        yesterdayRevenue: 0,
        yesterdayOrders: 0,
        monthlyTarget: 50000000, // Default target 50 juta
        targetAchievement: 0
    })
    const [topProducts, setTopProducts] = useState<TopPerformer[]>([])
    const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')
    
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadKPIData()
    }, [period])

    async function loadKPIData() {
        setLoading(true)
        try {
            const now = new Date()
            let currentStart: Date
            let previousStart: Date
            let previousEnd: Date

            // Calculate date ranges based on period
            if (period === 'week') {
                currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                previousEnd = new Date(currentStart.getTime() - 1)
                previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
            } else if (period === 'month') {
                currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
                previousEnd = new Date(currentStart.getTime() - 1)
                previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1)
            } else {
                // Quarter
                const currentQuarter = Math.floor(now.getMonth() / 3)
                currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1)
                previousEnd = new Date(currentStart.getTime() - 1)
                const prevQuarter = Math.floor(previousEnd.getMonth() / 3)
                previousStart = new Date(previousEnd.getFullYear(), prevQuarter * 3, 1)
            }

            // Today's date range
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)

            // Fetch current period orders
            const { data: currentOrders } = await supabase
                .from('orders')
                .select('total, created_at, user_id')
                .gte('created_at', currentStart.toISOString())
                .lte('created_at', now.toISOString())
                .eq('status', 'paid')

            // Fetch previous period orders
            const { data: previousOrders } = await supabase
                .from('orders')
                .select('total, created_at, user_id')
                .gte('created_at', previousStart.toISOString())
                .lte('created_at', previousEnd.toISOString())
                .eq('status', 'paid')

            // Fetch today's orders
            const { data: todayOrdersData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString())
                .eq('status', 'paid')

            // Fetch yesterday's orders
            const { data: yesterdayOrdersData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', yesterday.toISOString())
                .lt('created_at', today.toISOString())
                .eq('status', 'paid')

            // Calculate revenue metrics
            const currentPeriodRevenue = currentOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0
            const previousPeriodRevenue = previousOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0
            const revenueGrowth = previousPeriodRevenue > 0 
                ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
                : 0

            // Calculate order metrics
            const currentPeriodOrders = currentOrders?.length || 0
            const previousPeriodOrders = previousOrders?.length || 0
            const orderGrowth = previousPeriodOrders > 0 
                ? ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100 
                : 0

            const averageOrderValue = currentPeriodOrders > 0 
                ? currentPeriodRevenue / currentPeriodOrders 
                : 0
            const previousAverageOrderValue = previousPeriodOrders > 0 
                ? previousPeriodRevenue / previousPeriodOrders 
                : 0

            // Today's metrics
            const todayRevenue = todayOrdersData?.reduce((sum, o) => sum + Number(o.total), 0) || 0
            const todayOrders = todayOrdersData?.length || 0
            const yesterdayRevenue = yesterdayOrdersData?.reduce((sum, o) => sum + Number(o.total), 0) || 0
            const yesterdayOrders = yesterdayOrdersData?.length || 0

            // Fetch products data
            const { data: products } = await supabase
                .from('products')
                .select('id, stock')

            const totalProducts = products?.length || 0
            const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 10).length || 0
            const outOfStockProducts = products?.filter(p => p.stock === 0).length || 0

            // Fetch customers data
            const { data: allCustomers } = await supabase
                .from('profiles')
                .select('id, created_at')
                .eq('role', 'member')

            const totalCustomers = allCustomers?.length || 0
            const newCustomers = allCustomers?.filter(c => 
                new Date(c.created_at) >= currentStart
            ).length || 0

            // Calculate returning customers (customers who ordered in both periods)
            const currentCustomerIds = new Set(currentOrders?.map(o => o.user_id) || [])
            const previousCustomerIds = new Set(previousOrders?.map(o => o.user_id) || [])
            const returningCustomers = [...currentCustomerIds].filter(id => previousCustomerIds.has(id)).length
            const customerRetentionRate = previousCustomerIds.size > 0 
                ? (returningCustomers / previousCustomerIds.size) * 100 
                : 0

            // Calculate inventory turnover (simplified)
            const { data: orderItems } = await supabase
                .from('order_items')
                .select('quantity')
                .gte('created_at', currentStart.toISOString())

            const totalSoldItems = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
            const avgInventory = products?.reduce((sum, p) => sum + p.stock, 0) || 1
            const inventoryTurnover = avgInventory > 0 ? totalSoldItems / avgInventory : 0

            // Target achievement
            const monthlyTarget = 50000000 // 50 juta default
            const targetAchievement = (currentPeriodRevenue / monthlyTarget) * 100

            setKpiData({
                currentPeriodRevenue,
                previousPeriodRevenue,
                revenueGrowth,
                currentPeriodOrders,
                previousPeriodOrders,
                orderGrowth,
                averageOrderValue,
                previousAverageOrderValue,
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                inventoryTurnover,
                totalCustomers,
                newCustomers,
                returningCustomers,
                customerRetentionRate,
                todayRevenue,
                todayOrders,
                yesterdayRevenue,
                yesterdayOrders,
                monthlyTarget,
                targetAchievement
            })

            // Fetch top products
            const { data: topProductsData } = await supabase
                .from('order_items')
                .select(`
                    quantity,
                    price,
                    products (name)
                `)
                .gte('created_at', currentStart.toISOString())

            const productMap = new Map<string, { name: string; revenue: number }>()
            topProductsData?.forEach((item: any) => {
                const name = item.products?.name || 'Unknown'
                const revenue = item.price * item.quantity
                if (productMap.has(name)) {
                    productMap.get(name)!.revenue += revenue
                } else {
                    productMap.set(name, { name, revenue })
                }
            })

            const topProductsList = Array.from(productMap.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map(p => ({
                    name: p.name,
                    value: p.revenue,
                    change: Math.random() * 20 - 5 // Placeholder for actual change calculation
                }))

            setTopProducts(topProductsList)

        } catch (error) {
            console.error('Error loading KPI data:', error)
            showToast('Gagal memuat data KPI', 'error')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
            return `Rp ${(value / 1000).toFixed(0)}K`
        }
        return `Rp ${value.toLocaleString()}`
    }

    const getGrowthColor = (value: number) => {
        if (value > 0) return 'text-green-600'
        if (value < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    const getGrowthBg = (value: number) => {
        if (value > 0) return 'bg-green-100'
        if (value < 0) return 'bg-red-100'
        return 'bg-gray-100'
    }

    const GrowthIndicator = ({ value }: { value: number }) => (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGrowthBg(value)} ${getGrowthColor(value)}`}>
            {value > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : value < 0 ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
            {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </div>
    )

    const getStatusColor = (achievement: number) => {
        if (achievement >= 100) return 'bg-green-500'
        if (achievement >= 75) return 'bg-blue-500'
        if (achievement >= 50) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">KPI Dashboard</h1>
                            <p className="text-gray-600 mt-1">Key Performance Indicators Apotek</p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'quarter')}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="week">7 Hari Terakhir</option>
                                <option value="month">Bulan Ini</option>
                                <option value="quarter">Kuartal Ini</option>
                            </select>
                            <button
                                onClick={loadKPIData}
                                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Target Achievement */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-8 w-8" />
                                        <div>
                                            <h2 className="text-lg font-semibold">Target Pencapaian Bulanan</h2>
                                            <p className="text-blue-200 text-sm">Target: {formatCurrency(kpiData.monthlyTarget)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold">{kpiData.targetAchievement.toFixed(1)}%</p>
                                        <p className="text-blue-200 text-sm">Tercapai</p>
                                    </div>
                                </div>
                                <div className="w-full bg-blue-900/50 rounded-full h-4">
                                    <div 
                                        className={`h-4 rounded-full transition-all duration-500 ${getStatusColor(kpiData.targetAchievement)}`}
                                        style={{ width: `${Math.min(kpiData.targetAchievement, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-sm text-blue-200">
                                    <span>Rp 0</span>
                                    <span>{formatCurrency(kpiData.currentPeriodRevenue)} / {formatCurrency(kpiData.monthlyTarget)}</span>
                                </div>
                            </div>

                            {/* Today's Quick Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Hari Ini</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(kpiData.todayRevenue)}</p>
                                        </div>
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Kemarin: {formatCurrency(kpiData.yesterdayRevenue)}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pesanan Hari Ini</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{kpiData.todayOrders}</p>
                                        </div>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Kemarin: {kpiData.yesterdayOrders} pesanan
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Stok Rendah</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{kpiData.lowStockProducts}</p>
                                        </div>
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Habis: {kpiData.outOfStockProducts} produk
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pelanggan Baru</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{kpiData.newCustomers}</p>
                                        </div>
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Total: {kpiData.totalCustomers} pelanggan
                                    </p>
                                </div>
                            </div>

                            {/* Main KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                {/* Revenue Growth */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Pertumbuhan Pendapatan</h3>
                                        <GrowthIndicator value={kpiData.revenueGrowth} />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiData.currentPeriodRevenue)}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                vs {formatCurrency(kpiData.previousPeriodRevenue)} periode lalu
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${kpiData.revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {kpiData.revenueGrowth >= 0 ? (
                                                <TrendingUp className="h-6 w-6 text-green-600" />
                                            ) : (
                                                <TrendingDown className="h-6 w-6 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Growth */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Pertumbuhan Pesanan</h3>
                                        <GrowthIndicator value={kpiData.orderGrowth} />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{kpiData.currentPeriodOrders} pesanan</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                vs {kpiData.previousPeriodOrders} periode lalu
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${kpiData.orderGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <ShoppingCart className={`h-6 w-6 ${kpiData.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Average Order Value */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Rata-rata Nilai Pesanan</h3>
                                        <GrowthIndicator value={
                                            kpiData.previousAverageOrderValue > 0 
                                                ? ((kpiData.averageOrderValue - kpiData.previousAverageOrderValue) / kpiData.previousAverageOrderValue) * 100 
                                                : 0
                                        } />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiData.averageOrderValue)}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                vs {formatCurrency(kpiData.previousAverageOrderValue)} periode lalu
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-blue-100">
                                            <BarChart3 className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Retention */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Retensi Pelanggan</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            kpiData.customerRetentionRate >= 70 ? 'bg-green-100 text-green-600' :
                                            kpiData.customerRetentionRate >= 40 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {kpiData.customerRetentionRate >= 70 ? 'Baik' : 
                                             kpiData.customerRetentionRate >= 40 ? 'Cukup' : 'Perlu Perhatian'}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{kpiData.customerRetentionRate.toFixed(1)}%</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {kpiData.returningCustomers} pelanggan kembali
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-purple-100">
                                            <Users className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Inventory Turnover */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Perputaran Stok</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            kpiData.inventoryTurnover >= 2 ? 'bg-green-100 text-green-600' :
                                            kpiData.inventoryTurnover >= 1 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {kpiData.inventoryTurnover >= 2 ? 'Cepat' : 
                                             kpiData.inventoryTurnover >= 1 ? 'Normal' : 'Lambat'}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{kpiData.inventoryTurnover.toFixed(2)}x</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {kpiData.totalProducts} total produk
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-orange-100">
                                            <Package className="h-6 w-6 text-orange-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Health */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Kesehatan Stok</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            kpiData.outOfStockProducts === 0 ? 'bg-green-100 text-green-600' :
                                            kpiData.outOfStockProducts <= 5 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {kpiData.outOfStockProducts === 0 ? 'Sehat' : 
                                             kpiData.outOfStockProducts <= 5 ? 'Perlu Restock' : 'Kritis'}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-gray-600">Stok Aman</span>
                                            </div>
                                            <span className="font-semibold">{kpiData.totalProducts - kpiData.lowStockProducts - kpiData.outOfStockProducts}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm text-gray-600">Stok Rendah</span>
                                            </div>
                                            <span className="font-semibold text-yellow-600">{kpiData.lowStockProducts}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                <span className="text-sm text-gray-600">Stok Habis</span>
                                            </div>
                                            <span className="font-semibold text-red-600">{kpiData.outOfStockProducts}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Products */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Top 5 Produk Terlaris</h2>
                                <div className="space-y-4">
                                    {topProducts.length > 0 ? (
                                        topProducts.map((product, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                                        index === 0 ? 'bg-yellow-500' :
                                                        index === 1 ? 'bg-gray-400' :
                                                        index === 2 ? 'bg-orange-400' :
                                                        'bg-gray-300'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500">{formatCurrency(product.value)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">Belum ada data penjualan</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    )
}
