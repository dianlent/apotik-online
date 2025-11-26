'use client'

import { useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { Save, Package, Image, Tag, AlertTriangle } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function ProductsSettingsPage() {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        allowNegativeStock: false,
        autoGenerateSKU: true,
        skuPrefix: 'PRD',
        requireImages: true,
        maxImagesPerProduct: '5',
        defaultCategory: 'Obat Umum',
        enableBarcodeScanning: true,
        priceRoundingEnabled: true,
        priceRoundingValue: '1000',
        showOutOfStock: true,
        lowStockWarning: true,
        expiryDateTracking: true,
        expiryWarningDays: '30'
    })
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            showToast('Pengaturan produk berhasil disimpan', 'success')
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
                    <h1 className="text-3xl font-bold text-gray-900">Product Settings</h1>
                    <p className="text-gray-600 mt-2">Kelola pengaturan produk dan inventori</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Management */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Package className="h-5 w-5 mr-2 text-blue-600" />
                                Manajemen Produk
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Izinkan Stok Negatif
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Izinkan penjualan meskipun stok habis
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.allowNegativeStock}
                                            onChange={(e) => setSettings({ ...settings, allowNegativeStock: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Generate SKU Otomatis
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Buat SKU secara otomatis untuk produk baru
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoGenerateSKU}
                                            onChange={(e) => setSettings({ ...settings, autoGenerateSKU: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prefix SKU
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.skuPrefix}
                                        onChange={(e) => setSettings({ ...settings, skuPrefix: e.target.value })}
                                        placeholder="PRD"
                                        className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Contoh: PRD-001, PRD-002</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori Default
                                    </label>
                                    <select
                                        value={settings.defaultCategory}
                                        onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value })}
                                        className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Obat Umum">Obat Umum</option>
                                        <option value="Obat Keras">Obat Keras</option>
                                        <option value="Vitamin & Suplemen">Vitamin & Suplemen</option>
                                        <option value="Alat Kesehatan">Alat Kesehatan</option>
                                        <option value="Perawatan Tubuh">Perawatan Tubuh</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Image Settings */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Image className="h-5 w-5 mr-2 text-blue-600" />
                                Pengaturan Gambar
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Wajib Upload Gambar
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Produk harus memiliki minimal 1 gambar
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.requireImages}
                                            onChange={(e) => setSettings({ ...settings, requireImages: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maksimal Gambar per Produk
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.maxImagesPerProduct}
                                        onChange={(e) => setSettings({ ...settings, maxImagesPerProduct: e.target.value })}
                                        min="1"
                                        max="10"
                                        className="w-full md:w-1/4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Barcode & Pricing */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Tag className="h-5 w-5 mr-2 text-blue-600" />
                                Barcode & Harga
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Aktifkan Scan Barcode
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Gunakan barcode scanner untuk POS
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableBarcodeScanning}
                                            onChange={(e) => setSettings({ ...settings, enableBarcodeScanning: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Pembulatan Harga
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Bulatkan harga ke kelipatan tertentu
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.priceRoundingEnabled}
                                            onChange={(e) => setSettings({ ...settings, priceRoundingEnabled: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {settings.priceRoundingEnabled && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kelipatan Pembulatan (Rp)
                                        </label>
                                        <select
                                            value={settings.priceRoundingValue}
                                            onChange={(e) => setSettings({ ...settings, priceRoundingValue: e.target.value })}
                                            className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="100">100</option>
                                            <option value="500">500</option>
                                            <option value="1000">1,000</option>
                                            <option value="5000">5,000</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stock & Expiry */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
                                Stok & Kadaluarsa
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Tampilkan Produk Habis
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Tampilkan produk dengan stok 0 di katalog
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.showOutOfStock}
                                            onChange={(e) => setSettings({ ...settings, showOutOfStock: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Peringatan Stok Rendah
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Notifikasi saat stok produk menipis
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.lowStockWarning}
                                            onChange={(e) => setSettings({ ...settings, lowStockWarning: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Pelacakan Tanggal Kadaluarsa
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Track tanggal expired untuk produk obat
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.expiryDateTracking}
                                            onChange={(e) => setSettings({ ...settings, expiryDateTracking: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {settings.expiryDateTracking && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Peringatan Kadaluarsa (Hari)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.expiryWarningDays}
                                            onChange={(e) => setSettings({ ...settings, expiryWarningDays: e.target.value })}
                                            min="1"
                                            className="w-full md:w-1/4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Notifikasi akan muncul X hari sebelum expired</p>
                                    </div>
                                )}
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
