'use client'

import { useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { Save, ShoppingCart, Truck, Bell } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function OrdersSettingsPage() {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        autoConfirmOrders: false,
        requirePaymentProof: true,
        defaultShippingCost: '10000',
        freeShippingThreshold: '100000',
        orderPrefix: 'ORD',
        emailNotifications: true,
        smsNotifications: false,
        lowStockThreshold: '10'
    })
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            showToast('Pengaturan pesanan berhasil disimpan', 'success')
        } catch (error) {
            console.error('Error saving settings:', error)
            showToast('Gagal menyimpan pengaturan', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Order Settings</h1>
                    <p className="text-gray-600 mt-2">Kelola pengaturan pesanan dan pengiriman</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Order Processing */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                                Pemrosesan Pesanan
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Konfirmasi Otomatis
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Konfirmasi pesanan secara otomatis setelah pembayaran
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoConfirmOrders}
                                            onChange={(e) => setSettings({ ...settings, autoConfirmOrders: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Wajib Bukti Pembayaran
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Pelanggan harus upload bukti pembayaran
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.requirePaymentProof}
                                            onChange={(e) => setSettings({ ...settings, requirePaymentProof: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prefix Nomor Pesanan
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.orderPrefix}
                                        onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                                        placeholder="ORD"
                                        className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Contoh: ORD-20250123-001</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Settings */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Truck className="h-5 w-5 mr-2 text-blue-600" />
                                Pengaturan Pengiriman
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Biaya Pengiriman Default (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.defaultShippingCost}
                                        onChange={(e) => setSettings({ ...settings, defaultShippingCost: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Gratis Ongkir (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.freeShippingThreshold}
                                        onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                                Notifikasi
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Notifikasi Email
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Kirim email untuk update pesanan
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Notifikasi SMS
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Kirim SMS untuk update pesanan
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.smsNotifications}
                                            onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Inventori
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Batas Stok Rendah
                                </label>
                                <input
                                    type="number"
                                    value={settings.lowStockThreshold}
                                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                                    min="0"
                                    className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Notifikasi akan muncul jika stok di bawah angka ini</p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthGuard>
    )
}
