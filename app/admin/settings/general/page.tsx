'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Save, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { useSettings } from '@/context/SettingsContext'

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(false)
    const { generalSettings, updateGeneralSettings } = useSettings()
    const [settings, setSettings] = useState({
        storeName: '',
        storeEmail: '',
        storePhone: '',
        storeAddress: '',
        taxRate: '11',
        currency: 'IDR',
        pakasirMerchantCode: '',
        pakasirApiKey: '',
        pakasirCallbackUrl: '',
        pakasirReturnUrl: '',
        pakasirSandboxMode: true
    })
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        if (generalSettings) {
            setSettings(generalSettings)
        }
    }, [generalSettings])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            // Update context (will save to database)
            await updateGeneralSettings(settings)
            
            showToast('Pengaturan berhasil disimpan', 'success')
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
                    <h1 className="text-3xl font-bold text-gray-900">General Settings</h1>
                    <p className="text-gray-600 mt-2">Kelola pengaturan umum toko Anda</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Store Information */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                                Informasi Toko
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Toko
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.storeName}
                                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="inline h-4 w-4 mr-1" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.storeEmail}
                                        onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="inline h-4 w-4 mr-1" />
                                        Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        value={settings.storePhone}
                                        onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="inline h-4 w-4 mr-1" />
                                        Alamat
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.storeAddress}
                                        onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financial Settings */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Pengaturan Keuangan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pajak (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.taxRate}
                                        onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">PPN standar Indonesia: 11%</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mata Uang
                                    </label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="IDR">IDR - Indonesian Rupiah</option>
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Payment Gateway - Pakasir */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment Gateway - Pakasir
                            </h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 mb-2">
                                    <strong>Info:</strong> Konfigurasi payment gateway Pakasir untuk menerima pembayaran QRIS, Virtual Account, E-Wallet, dan metode lainnya.
                                </p>
                                <a 
                                    href="https://pakasir.com/p/docs" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    📖 Baca Dokumentasi Pakasir →
                                </a>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Merchant Code
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.pakasirMerchantCode}
                                        onChange={(e) => setSettings({ ...settings, pakasirMerchantCode: e.target.value })}
                                        placeholder="Contoh: MERCHANT123"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Merchant Code dari dashboard Pakasir
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={settings.pakasirApiKey}
                                        onChange={(e) => setSettings({ ...settings, pakasirApiKey: e.target.value })}
                                        placeholder="••••••••••••••••"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        API Key dari dashboard Pakasir (rahasia)
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Callback URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.pakasirCallbackUrl}
                                        onChange={(e) => setSettings({ ...settings, pakasirCallbackUrl: e.target.value })}
                                        placeholder="https://your-domain.com/api/payment/callback"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL untuk menerima notifikasi pembayaran dari Pakasir
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Return URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.pakasirReturnUrl}
                                        onChange={(e) => setSettings({ ...settings, pakasirReturnUrl: e.target.value })}
                                        placeholder="https://your-domain.com/payment/success"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL redirect setelah customer menyelesaikan pembayaran
                                    </p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <label className="font-medium text-gray-900">
                                            Mode Sandbox
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            Gunakan mode testing untuk development (Sandbox) atau Production untuk live
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.pakasirSandboxMode}
                                            onChange={(e) => setSettings({ ...settings, pakasirSandboxMode: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                            {settings.pakasirSandboxMode ? 'Sandbox' : 'Production'}
                                        </span>
                                    </label>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>⚠️ Penting:</strong> Pastikan Callback URL dan Return URL sudah terdaftar di dashboard Pakasir untuk keamanan.
                                    </p>
                                </div>
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
