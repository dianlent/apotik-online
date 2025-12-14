
'use client'

import { useEffect, useMemo, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { createClient } from '@/lib/supabase/client'
import { Product, StockOpnameItem, StockOpnameSession } from '@/types'
import { useToast } from '@/context/ToastContext'
import {
    ClipboardList,
    ClipboardCheck,
    History,
    RefreshCcw,
    Search,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    MinusCircle,
    PlusCircle
} from 'lucide-react'

type StockOpnameItemWithProduct = StockOpnameItem & { product: Product | null }

const statusBadge = (status: StockOpnameSession['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-700'
        case 'in_progress':
            return 'bg-blue-100 text-blue-700'
        default:
            return 'bg-gray-100 text-gray-700'
    }
}

const formatDateTime = (value?: string | null) => {
    if (!value) return '-'
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const generateReferenceCode = () => {
    const now = new Date()
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    const randomPart = Math.floor(100 + Math.random() * 900)
    return `SO-${datePart}${timePart}-${randomPart}`
}
export default function StockOpnamePage() {
    const supabase = createClient()
    const { showToast } = useToast()
    const [activeSession, setActiveSession] = useState<StockOpnameSession | null>(null)
    const [items, setItems] = useState<StockOpnameItemWithProduct[]>([])
    const [history, setHistory] = useState<StockOpnameSession[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [starting, setStarting] = useState(false)
    const [finalizing, setFinalizing] = useState(false)
    const [showStartModal, setShowStartModal] = useState(false)
    const [startNotes, setStartNotes] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'difference'>('all')
    const [localCounts, setLocalCounts] = useState<Record<string, string>>({})
    const [savingItemId, setSavingItemId] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) {
                setCurrentUserId(data.user.id)
            }
        })
        loadStockOpname()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadStockOpname = async (silent = false) => {
        if (silent) {
            setRefreshing(true)
        } else {
            setLoading(true)
        }

        try {
            const { data: sessionRows, error: sessionError } = await supabase
                .from('stock_opname_sessions')
                .select('*')
                .in('status', ['draft', 'in_progress'])
                .order('created_at', { ascending: false })
                .limit(1)

            if (sessionError) throw sessionError

            const session = sessionRows?.[0] ?? null
            setActiveSession(session ?? null)

            if (session) {
                const { data: itemsData, error: itemsError } = await supabase
                    .from('stock_opname_items')
                    .select(`
                        id,
                        session_id,
                        product_id,
                        system_stock,
                        counted_stock,
                        note,
                        difference,
                        created_at,
                        product:products (
                            id,
                            name,
                            barcode,
                            price,
                            stock,
                            image_url
                        )
                    `)
                    .eq('session_id', session.id)
                    .order('created_at', { ascending: true })

                if (itemsError) throw itemsError

                const typedItems = (itemsData || []) as StockOpnameItemWithProduct[]
                setItems(typedItems)

                const initialCounts: Record<string, string> = {}
                typedItems.forEach(item => {
                    initialCounts[item.id] = typeof item.counted_stock === 'number' ? String(item.counted_stock) : ''
                })
                setLocalCounts(initialCounts)
            } else {
                setItems([])
                setLocalCounts({})
            }

            const { data: historyData, error: historyError } = await supabase
                .from('stock_opname_sessions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            if (historyError) throw historyError
            setHistory(historyData || [])
        } catch (error) {
            console.error('Error loading stock opname data', error)
            showToast('Gagal memuat data stok opname', 'error')
        } finally {
            if (silent) {
                setRefreshing(false)
            } else {
                setLoading(false)
            }
        }
    }
    const stats = useMemo(() => {
        if (!items.length) {
            return {
                total: 0,
                counted: 0,
                pending: 0,
                differences: 0,
                shortage: 0,
                surplus: 0,
                totalDifference: 0
            }
        }

        const countedItems = items.filter(item => typeof item.counted_stock === 'number')
        const differenceItems = countedItems.filter(item => (item.counted_stock ?? 0) !== item.system_stock)

        return {
            total: items.length,
            counted: countedItems.length,
            pending: items.length - countedItems.length,
            differences: differenceItems.length,
            shortage: differenceItems.filter(item => (item.counted_stock ?? 0) < item.system_stock).length,
            surplus: differenceItems.filter(item => (item.counted_stock ?? 0) > item.system_stock).length,
            totalDifference: differenceItems.reduce(
                (sum, item) => sum + Math.abs((item.counted_stock ?? 0) - item.system_stock),
                0
            )
        }
    }, [items])

    const filteredItems = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return items.filter(item => {
            const name = item.product?.name?.toLowerCase() ?? ''
            const barcode = item.product?.barcode?.toLowerCase() ?? ''
            const matchesSearch = name.includes(query) || barcode.includes(query)

            if (!matchesSearch) return false
            if (filterStatus === 'pending') return item.counted_stock === null || typeof item.counted_stock !== 'number'
            if (filterStatus === 'difference') {
                return typeof item.counted_stock === 'number' && item.counted_stock !== item.system_stock
            }
            return true
        })
    }, [items, searchQuery, filterStatus])
    const handleCountChange = (itemId: string, value: string) => {
        if (value === '' || /^[0-9\b]+$/.test(value)) {
            setLocalCounts(prev => ({
                ...prev,
                [itemId]: value
            }))
        }
    }

    const handleSaveCount = async (itemId: string) => {
        const rawValue = localCounts[itemId]
        const countedValue = rawValue === '' || rawValue === undefined ? null : Number(rawValue)

        if (countedValue !== null && (Number.isNaN(countedValue) || countedValue < 0)) {
            showToast('Jumlah stok tidak valid', 'error')
            return
        }

        setSavingItemId(itemId)
        try {
            const { error } = await supabase
                .from('stock_opname_items')
                .update({ counted_stock: countedValue })
                .eq('id', itemId)

            if (error) throw error

            setItems(prev =>
                prev.map(item =>
                    item.id === itemId
                        ? {
                              ...item,
                              counted_stock: countedValue
                          }
                        : item
                )
            )
            showToast('Hitungan stok disimpan', 'success')
        } catch (error) {
            console.error('Error saving counted stock', error)
            showToast('Gagal menyimpan hitungan stok', 'error')
        } finally {
            setSavingItemId(null)
        }
    }

    const handleStartSession = async () => {
        if (activeSession) {
            showToast('Sesi stok opname masih berjalan', 'info')
            return
        }

        setStarting(true)
        try {
            const { data } = await supabase.auth.getUser()
            const userId = data?.user?.id

            if (!userId) {
                showToast('User tidak ditemukan', 'error')
                return
            }

            const referenceCode = generateReferenceCode()
            const { data: newSession, error: sessionError } = await supabase
                .from('stock_opname_sessions')
                .insert({
                    reference_code: referenceCode,
                    status: 'in_progress',
                    notes: startNotes || null,
                    created_by: userId,
                    started_at: new Date().toISOString()
                })
                .select()
                .single()

            if (sessionError) throw sessionError

            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, stock')
                .order('name', { ascending: true })

            if (productsError) throw productsError

            const payload = (products || []).map(product => ({
                session_id: newSession.id,
                product_id: product.id,
                system_stock: product.stock ?? 0
            }))

            if (payload.length) {
                const chunkSize = 100
                for (let i = 0; i < payload.length; i += chunkSize) {
                    const chunk = payload.slice(i, i + chunkSize)
                    const { error: chunkError } = await supabase.from('stock_opname_items').insert(chunk)
                    if (chunkError) throw chunkError
                }
            }

            await supabase
                .from('stock_opname_sessions')
                .update({ total_items: payload.length })
                .eq('id', newSession.id)

            showToast('Sesi stok opname dimulai', 'success')
            setShowStartModal(false)
            setStartNotes('')
            await loadStockOpname()
        } catch (error) {
            console.error('Error starting stock opname session', error)
            showToast('Gagal memulai sesi stok opname', 'error')
        } finally {
            setStarting(false)
        }
    }
    const handleFinalizeSession = async () => {
        if (!activeSession) return
        if (items.some(item => typeof item.counted_stock !== 'number')) {
            showToast('Masih ada produk yang belum dihitung', 'error')
            return
        }

        setFinalizing(true)
        try {
            const differences = items.filter(
                item => typeof item.counted_stock === 'number' && item.counted_stock !== item.system_stock
            )

            if (differences.length) {
                await Promise.all(
                    differences.map(item =>
                        supabase
                            .from('products')
                            .update({ stock: item.counted_stock })
                            .eq('id', item.product_id)
                    )
                )

                const logsPayload = differences.map(item => ({
                    product_id: item.product_id,
                    type: 'adjustment',
                    quantity: Math.abs((item.counted_stock ?? 0) - item.system_stock),
                    previous_stock: item.system_stock,
                    current_stock: item.counted_stock,
                    notes: `Stock opname ${activeSession.reference_code}`,
                    reference_id: activeSession.id,
                    created_by: currentUserId ?? undefined
                }))

                if (logsPayload.length) {
                    await supabase.from('inventory_logs').insert(logsPayload)
                }
            }

            await supabase
                .from('stock_opname_sessions')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    total_adjusted: differences.length,
                    total_difference: differences.reduce(
                        (sum, item) => sum + Math.abs((item.counted_stock ?? 0) - item.system_stock),
                        0
                    )
                })
                .eq('id', activeSession.id)

            showToast('Sesi stok opname diselesaikan', 'success')
            await loadStockOpname()
        } catch (error) {
            console.error('Error finalizing stock opname session', error)
            showToast('Gagal menyelesaikan sesi', 'error')
        } finally {
            setFinalizing(false)
        }
    }
    return (
        <AuthGuard allowedRoles={['admin', 'apoteker']}>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Inventory Control</p>
                        <h1 className="text-3xl font-bold text-gray-900">Stock Opname</h1>
                        <p className="text-gray-600 mt-2">
                            Jalankan perhitungan fisik, catat selisih stok, dan sinkronkan dengan sistem POS
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => loadStockOpname(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading || refreshing}
                        >
                            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                            Refresh
                        </button>
                        {activeSession ? (
                            <>
                                <button
                                    onClick={() => setShowStartModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                    disabled={starting}
                                >
                                    <ClipboardList className="h-4 w-4" />
                                    Sesi Baru
                                </button>
                                <button
                                    onClick={handleFinalizeSession}
                                    disabled={finalizing || items.length === 0 || stats.pending > 0}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                                >
                                    {finalizing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ClipboardCheck className="h-4 w-4" />
                                    )}
                                    Selesaikan Sesi
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowStartModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                <ClipboardList className="h-4 w-4" />
                                Mulai Sesi Stock Opname
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Menyiapkan data stok opname...</p>
                        </div>
                    </div>
                ) : activeSession ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Sesi Berjalan</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">
                                            {activeSession.reference_code}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge(activeSession.status)}`}
                                    >
                                        {activeSession.status === 'in_progress' ? 'Berjalan' : activeSession.status}
                                    </span>
                                </div>
                                <dl className="mt-4 space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <dt>Mulai</dt>
                                        <dd className="font-medium text-gray-900">{formatDateTime(activeSession.started_at)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt>Estimasi Selesai</dt>
                                        <dd className="text-gray-900">Manual</dd>
                                    </div>
                                    {activeSession.notes && (
                                        <div>
                                            <dt className="text-gray-500">Catatan</dt>
                                            <dd className="font-medium text-gray-900">{activeSession.notes}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">Progres Penghitungan</p>
                                <div className="mt-4">
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-bold text-gray-900">{stats.counted}</p>
                                        <span className="text-sm text-gray-500">dari {stats.total} produk</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 mt-4 overflow-hidden">
                                        <div
                                            className="h-3 bg-blue-600 rounded-full transition-all"
                                            style={{
                                                width: `${stats.total === 0 ? 0 : (stats.counted / stats.total) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Pending: {stats.pending} produk belum dihitung
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">Ringkasan Selisih</p>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-red-50">
                                        <p className="text-xs uppercase text-red-600 tracking-wide">Minus</p>
                                        <p className="text-2xl font-semibold text-red-700">{stats.shortage}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-green-50">
                                        <p className="text-xs uppercase text-green-600 tracking-wide">Surplus</p>
                                        <p className="text-2xl font-semibold text-green-700">{stats.surplus}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-3">
                                    Total selisih tercatat:{' '}
                                    <span className="font-semibold text-gray-900">{stats.totalDifference}</span> unit
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="p-6 border-b border-gray-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1 relative">
                                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama produk atau barcode..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            filterStatus === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('pending')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            filterStatus === 'pending'
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Belum Dihitung
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('difference')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            filterStatus === 'difference'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Ada Selisih
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Produk
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stok Sistem
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Penghitungan Fisik
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Selisih
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredItems.map(item => {
                                            const difference =
                                                typeof item.counted_stock === 'number'
                                                    ? (item.counted_stock ?? 0) - item.system_stock
                                                    : null
                                            const status =
                                                typeof item.counted_stock !== 'number'
                                                    ? { label: 'Belum dihitung', color: 'bg-gray-100 text-gray-700' }
                                                    : difference === 0
                                                    ? { label: 'Sesuai', color: 'bg-green-100 text-green-700' }
                                                    : difference > 0
                                                    ? { label: 'Surplus', color: 'bg-blue-100 text-blue-700' }
                                                    : { label: 'Minus', color: 'bg-red-100 text-red-700' }

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100">
                                                                {item.product?.image_url ? (
                                                                    <img
                                                                        src={item.product.image_url}
                                                                        alt={item.product.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                                                        IMG
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {item.product?.name || 'Produk'}
                                                                </p>
                                                                {item.product?.barcode && (
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                                        {item.product.barcode}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-semibold text-gray-900">{item.system_stock}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={localCounts[item.id] ?? ''}
                                                                onChange={e => handleCountChange(item.id, e.target.value)}
                                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    setLocalCounts(prev => ({
                                                                        ...prev,
                                                                        [item.id]: String(item.system_stock)
                                                                    }))
                                                                }
                                                                className="text-xs text-gray-500 hover:text-gray-800"
                                                            >
                                                                Sama seperti sistem
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {difference === null ? (
                                                            <p className="text-sm text-gray-500">-</p>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                                {difference > 0 ? (
                                                                    <PlusCircle className="h-4 w-4 text-green-600" />
                                                                ) : difference < 0 ? (
                                                                    <MinusCircle className="h-4 w-4 text-red-600" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                )}
                                                                <span
                                                                    className={
                                                                        difference > 0
                                                                            ? 'text-green-600'
                                                                            : difference < 0
                                                                            ? 'text-red-600'
                                                                            : 'text-gray-800'
                                                                    }
                                                                >
                                                                    {difference}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${status.color}`}
                                                        >
                                                            {status.label === 'Belum dihitung' && (
                                                                <AlertTriangle className="h-3 w-3" />
                                                            )}
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleSaveCount(item.id)}
                                                            disabled={savingItemId === item.id}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                                                        >
                                                            {savingItemId === item.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <ClipboardCheck className="h-4 w-4" />
                                                            )}
                                                            Simpan
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {!filteredItems.length && (
                                            <tr>
                                                <td className="px-6 py-12 text-center text-gray-500 text-sm" colSpan={6}>
                                                    Tidak ada produk yang sesuai dengan filter
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white border border-dashed border-blue-200 rounded-2xl p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
                            <ClipboardList className="h-7 w-7" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mt-4">Belum Ada Sesi Stock Opname</h3>
                        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                            Gunakan sesi stok opname untuk mencatat hasil penghitungan fisik dan bandingkan dengan stok di
                            sistem sebelum melakukan penyesuaian otomatis.
                        </p>
                        <button
                            onClick={() => setShowStartModal(true)}
                            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <ClipboardList className="h-5 w-5" />
                            Mulai Sesi Baru
                        </button>
                    </div>
                )}

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <History className="h-5 w-5 text-gray-600" />
                        <div>
                            <p className="text-lg font-semibold text-gray-900">Riwayat Stock Opname</p>
                            <p className="text-sm text-gray-500">5 sesi terakhir</p>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {history.length ? (
                            history.map(session => (
                                <div
                                    key={session.id}
                                    className="p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{session.reference_code}</p>
                                        <p className="text-xs text-gray-500">
                                            Mulai {formatDateTime(session.started_at)} • Selesai {formatDateTime(session.completed_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-gray-600">
                                            <p>Total produk: {session.total_items ?? '-'}</p>
                                            <p>Penyesuaian: {session.total_adjusted ?? 0}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge(session.status)}`}>
                                            {session.status === 'completed' ? 'Selesai' : session.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-6 text-center text-gray-500 text-sm">Belum ada riwayat stok opname</p>
                        )}
                    </div>
                </div>
            </div>
            {showStartModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900">Mulai Sesi Stock Opname</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            Sistem akan mengambil snapshot stok saat ini dan menyiapkan daftar seluruh produk untuk dihitung.
                        </p>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Catatan (Opsional)</label>
                                <textarea
                                    value={startNotes}
                                    onChange={e => setStartNotes(e.target.value)}
                                    rows={3}
                                    className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Contoh: Regular stock take akhir bulan"
                                />
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                                <p className="font-semibold">Sebelum mulai:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Pastikan tidak ada transaksi keluar/masuk selama sesi berjalan</li>
                                    <li>Gunakan perangkat mobile atau tablet saat menghitung stok di rak</li>
                                    <li>Simpan progres produk secara berkala untuk mencegah kehilangan data</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowStartModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={starting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleStartSession}
                                disabled={starting}
                                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
                            >
                                {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardList className="h-5 w-5" />}
                                Mulai Sesi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthGuard>
    )
}
