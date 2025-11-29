'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { TrendingUp, DollarSign, ShoppingCart, Package, Calendar, Download, Filter } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

interface SalesStats {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    averageOrderValue: number
}

interface TopProduct {
    id: string
    name: string
    total_quantity: number
    total_revenue: number
}

interface DailySales {
    date: string
    total_revenue: number
    total_orders: number
}

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function ReportsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<SalesStats>({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        averageOrderValue: 0
    })
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [dailySales, setDailySales] = useState<DailySales[]>([])
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        loadReports()
    }, [dateRange])

    async function loadReports() {
        setLoading(true)
        try {
            // Load sales stats
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total, created_at')
                .gte('created_at', `${dateRange.startDate}T00:00:00`)
                .lte('created_at', `${dateRange.endDate}T23:59:59`)
                .eq('status', 'paid')

            if (ordersError) throw ordersError

            const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
            const totalOrders = orders?.length || 0
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

            // Load total products
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            setStats({
                totalRevenue,
                totalOrders,
                totalProducts: productsCount || 0,
                averageOrderValue
            })

            // Load top products
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select(`
                    quantity,
                    price,
                    product_id,
                    products (name)
                `)
                .gte('created_at', `${dateRange.startDate}T00:00:00`)
                .lte('created_at', `${dateRange.endDate}T23:59:59`)

            if (itemsError) throw itemsError

            // Group by product
            const productMap = new Map<string, TopProduct>()
            orderItems?.forEach((item: any) => {
                const productId = item.product_id
                const productName = item.products?.name || 'Unknown'
                const quantity = item.quantity
                const revenue = item.price * item.quantity

                if (productMap.has(productId)) {
                    const existing = productMap.get(productId)!
                    existing.total_quantity += quantity
                    existing.total_revenue += revenue
                } else {
                    productMap.set(productId, {
                        id: productId,
                        name: productName,
                        total_quantity: quantity,
                        total_revenue: revenue
                    })
                }
            })

            const topProductsArray = Array.from(productMap.values())
                .sort((a, b) => b.total_revenue - a.total_revenue)
                .slice(0, 10)

            setTopProducts(topProductsArray)

            // Load daily sales
            const salesByDate = new Map<string, DailySales>()
            orders?.forEach((order) => {
                const date = new Date(order.created_at).toISOString().split('T')[0]
                if (salesByDate.has(date)) {
                    const existing = salesByDate.get(date)!
                    existing.total_revenue += Number(order.total)
                    existing.total_orders += 1
                } else {
                    salesByDate.set(date, {
                        date,
                        total_revenue: Number(order.total),
                        total_orders: 1
                    })
                }
            })

            const dailySalesArray = Array.from(salesByDate.values())
                .sort((a, b) => a.date.localeCompare(b.date))

            setDailySales(dailySalesArray)

        } catch (error) {
            console.error('Error loading reports:', error)
            showToast('Gagal memuat laporan', 'error')
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        const csvData = [
            ['Laporan Penjualan'],
            ['Periode', `${dateRange.startDate} - ${dateRange.endDate}`],
            [''],
            ['Total Pendapatan', `Rp ${stats.totalRevenue.toLocaleString()}`],
            ['Total Pesanan', stats.totalOrders.toString()],
            ['Rata-rata Nilai Pesanan', `Rp ${stats.averageOrderValue.toLocaleString()}`],
            [''],
            ['Top 10 Produk Terlaris'],
            ['No', 'Nama Produk', 'Jumlah Terjual', 'Total Pendapatan'],
            ...topProducts.map((product, index) => [
                (index + 1).toString(),
                product.name,
                product.total_quantity.toString(),
                `Rp ${product.total_revenue.toLocaleString()}`
            ])
        ]

        const csv = csvData.map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan-penjualan-${dateRange.startDate}-${dateRange.endDate}.csv`
        a.click()
        showToast('Laporan berhasil diexport', 'success')
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan Penjualan</h1>
                        <p className="text-gray-600">Analisis dan statistik penjualan</p>
                    </div>

                    {/* Date Range Filter */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={exportToCSV}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <DollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Pendapatan</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rp {stats.totalRevenue.toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Pesanan</h3>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Rata-rata Nilai</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rp {stats.averageOrderValue.toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-orange-100 rounded-lg">
                                            <Package className="h-6 w-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Produk</h3>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                                </div>
                            </div>

                            {/* Top Products */}
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Top 10 Produk Terlaris</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Produk</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Jumlah Terjual</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Pendapatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((product, index) => (
                                                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{product.name}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{product.total_quantity}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                                                        Rp {product.total_revenue.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Daily Sales Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Revenue Chart */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Grafik Pendapatan Harian</h2>
                                    <div className="h-80">
                                        <Line
                                            data={{
                                                labels: dailySales.map(day => 
                                                    new Date(day.date).toLocaleDateString('id-ID', { 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })
                                                ),
                                                datasets: [
                                                    {
                                                        label: 'Pendapatan (Rp)',
                                                        data: dailySales.map(day => day.total_revenue),
                                                        borderColor: 'rgb(34, 197, 94)',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 4,
                                                        pointHoverRadius: 6,
                                                        pointBackgroundColor: 'rgb(34, 197, 94)',
                                                        pointBorderColor: '#fff',
                                                        pointBorderWidth: 2,
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'top' as const,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function(context) {
                                                                return 'Rp ' + (context.parsed.y ?? 0).toLocaleString()
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            callback: function(value) {
                                                                return 'Rp ' + Number(value).toLocaleString()
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Orders Chart */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Grafik Jumlah Pesanan</h2>
                                    <div className="h-80">
                                        <Line
                                            data={{
                                                labels: dailySales.map(day => 
                                                    new Date(day.date).toLocaleDateString('id-ID', { 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })
                                                ),
                                                datasets: [
                                                    {
                                                        label: 'Jumlah Pesanan',
                                                        data: dailySales.map(day => day.total_orders),
                                                        borderColor: 'rgb(59, 130, 246)',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 4,
                                                        pointHoverRadius: 6,
                                                        pointBackgroundColor: 'rgb(59, 130, 246)',
                                                        pointBorderColor: '#fff',
                                                        pointBorderWidth: 2,
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'top' as const,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function(context) {
                                                                return (context.parsed.y ?? 0) + ' pesanan'
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            stepSize: 1
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Daily Sales Table */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Detail Penjualan Harian</h2>
                                <div className="space-y-4">
                                    {dailySales.map((day) => (
                                        <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(day.date).toLocaleDateString('id-ID', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-600">{day.total_orders} pesanan</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600">
                                                    Rp {day.total_revenue.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    )
}
