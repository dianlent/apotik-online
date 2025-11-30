'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import { Save, Building2, Mail, Phone, MapPin, CreditCard, Banknote, QrCode, Landmark, Webhook, Package } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { useSettings } from '@/context/SettingsContext'

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'store' | 'gateway' | 'webhook'>('store')
    const { generalSettings, updateGeneralSettings } = useSettings()
    const [settings, setSettings] = useState({
        storeName: '',
        storeEmail: '',
        storePhone: '',
        storeAddress: '',
        taxRate: '11',
        currency: 'IDR',
        duitkuMerchantCode: '',
        duitkuApiKey: '',
        duitkuCallbackUrl: '',
        duitkuReturnUrl: '',
        duitkuSandboxMode: true,
        bankName: 'BCA',
        bankAccountNumber: '1234567890',
        bankAccountName: 'APOTIK POS',
        enableCash: true,
        enableCard: true,
        enableQris: true,
        enableTransfer: true,
        n8nContactWebhook: '',
        n8nOrderWebhook: '',
        n8nRoleRequestWebhook: '',
        n8nEnabled: false
    })
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        if (generalSettings) {
            // Auto-fill callback and return URLs if empty
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
            const updatedSettings = {
                ...generalSettings,
                duitkuCallbackUrl: generalSettings.duitkuCallbackUrl || `${appUrl}/api/payment/callback`,
                duitkuReturnUrl: generalSettings.duitkuReturnUrl || `${appUrl}/payment/success`,
                n8nContactWebhook: generalSettings.n8nContactWebhook || '',
                n8nOrderWebhook: generalSettings.n8nOrderWebhook || '',
                n8nRoleRequestWebhook: generalSettings.n8nRoleRequestWebhook || '',
                n8nEnabled: generalSettings.n8nEnabled || false
            }
            setSettings(updatedSettings)
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

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('store')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'store'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Building2 className="inline h-5 w-5 mr-2" />
                                Informasi Toko
                            </button>
                            <button
                                onClick={() => setActiveTab('gateway')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'gateway'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <QrCode className="inline h-5 w-5 mr-2" />
                                Payment Gateway
                            </button>
                            <button
                                onClick={() => setActiveTab('webhook')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'webhook'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Webhook className="inline h-5 w-5 mr-2" />
                                N8N Webhook
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Store Information Tab */}
                        {activeTab === 'store' && (
                        <>
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
                        </>
                        )}

                        {/* Payment Gateway Tab */}
                        {activeTab === 'gateway' && (
                        <div>
                        {/* Bank Transfer Configuration */}
                        <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Landmark className="h-8 w-8 text-green-600" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Transfer Bank Manual</h3>
                                        <p className="text-sm text-gray-600">Konfigurasi rekening bank untuk pembayaran manual</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enableTransfer}
                                        onChange={(e) => setSettings({ ...settings, enableTransfer: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                            
                            {settings.enableTransfer && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Bank
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.bankName}
                                            onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                                            placeholder="Contoh: BCA"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor Rekening
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.bankAccountNumber}
                                            onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                                            placeholder="1234567890"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Atas Nama
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.bankAccountName}
                                            onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                                            placeholder="APOTIK POS"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Gateway - Duitku */}
                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment Gateway - Duitku
                            </h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 mb-2">
                                    <strong>Info:</strong> Konfigurasi payment gateway Duitku untuk menerima pembayaran QRIS, Virtual Account, E-Wallet, dan metode lainnya.
                                </p>
                                <a 
                                    href="https://docs.duitku.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    📖 Baca Dokumentasi Duitku →
                                </a>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Merchant Code
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.duitkuMerchantCode}
                                        onChange={(e) => setSettings({ ...settings, duitkuMerchantCode: e.target.value })}
                                        placeholder="Contoh: D1234"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Merchant Code dari dashboard Duitku
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={settings.duitkuApiKey}
                                        onChange={(e) => setSettings({ ...settings, duitkuApiKey: e.target.value })}
                                        placeholder="••••••••••••••••"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        API Key dari dashboard Duitku (rahasia)
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Callback URL
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={settings.duitkuCallbackUrl}
                                            onChange={(e) => setSettings({ ...settings, duitkuCallbackUrl: e.target.value })}
                                            placeholder="https://your-domain.com/api/payment/callback"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
                                                setSettings({ ...settings, duitkuCallbackUrl: `${appUrl}/api/payment/callback` })
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                        >
                                            Auto-fill
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL untuk menerima notifikasi pembayaran dari Duitku
                                    </p>
                                    {settings.duitkuCallbackUrl && (
                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                            <span className="text-green-700 font-semibold">✓ URL:</span>
                                            <code className="ml-1 text-green-800">{settings.duitkuCallbackUrl}</code>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Return URL
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={settings.duitkuReturnUrl}
                                            onChange={(e) => setSettings({ ...settings, duitkuReturnUrl: e.target.value })}
                                            placeholder="https://your-domain.com/payment/success"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
                                                setSettings({ ...settings, duitkuReturnUrl: `${appUrl}/payment/success` })
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                        >
                                            Auto-fill
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL redirect setelah customer menyelesaikan pembayaran
                                    </p>
                                    {settings.duitkuReturnUrl && (
                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                            <span className="text-green-700 font-semibold">✓ URL:</span>
                                            <code className="ml-1 text-green-800">{settings.duitkuReturnUrl}</code>
                                        </div>
                                    )}
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
                                            checked={settings.duitkuSandboxMode}
                                            onChange={(e) => setSettings({ ...settings, duitkuSandboxMode: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                            {settings.duitkuSandboxMode ? 'Sandbox' : 'Production'}
                                        </span>
                                    </label>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>⚠️ Penting:</strong> Pastikan Callback URL dan Return URL sudah terdaftar di dashboard Duitku untuk keamanan.
                                    </p>
                                </div>
                            </div>
                        </div>
                        </div>
                        )}

                        {/* N8N Webhook Tab */}
                        {activeTab === 'webhook' && (
                        <>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Webhook className="h-5 w-5 mr-2 text-blue-600" />
                                Konfigurasi N8N Webhook
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Integrasikan sistem dengan N8N untuk automasi workflow seperti notifikasi, email, dan proses bisnis lainnya.
                            </p>

                            {/* Enable N8N */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="font-medium text-gray-900 text-lg">
                                            Aktifkan N8N Webhook
                                        </label>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Enable untuk mengirim data ke N8N workflows
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.n8nEnabled}
                                            onChange={(e) => setSettings({ ...settings, n8nEnabled: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                            {settings.n8nEnabled ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Webhook URLs */}
                            <div className="space-y-6">
                                {/* Contact Form Webhook */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="inline h-4 w-4 mr-1" />
                                        Contact Form Webhook URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.n8nContactWebhook}
                                        onChange={(e) => setSettings({ ...settings, n8nContactWebhook: e.target.value })}
                                        placeholder="https://your-n8n-instance.com/webhook/contact"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Webhook untuk menerima data dari contact form (halaman /contact)
                                    </p>
                                </div>

                                {/* Order Webhook */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Package className="inline h-4 w-4 mr-1" />
                                        Order Webhook URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.n8nOrderWebhook}
                                        onChange={(e) => setSettings({ ...settings, n8nOrderWebhook: e.target.value })}
                                        placeholder="https://your-n8n-instance.com/webhook/order"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Webhook untuk menerima data pesanan baru dari customer
                                    </p>
                                </div>

                                {/* Role Request Webhook */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Building2 className="inline h-4 w-4 mr-1" />
                                        Role Request Webhook URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.n8nRoleRequestWebhook}
                                        onChange={(e) => setSettings({ ...settings, n8nRoleRequestWebhook: e.target.value })}
                                        placeholder="https://your-n8n-instance.com/webhook/role-request"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Webhook untuk notifikasi saat ada permintaan perubahan role (kasir/apoteker)
                                    </p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                    <Webhook className="h-4 w-4 mr-2" />
                                    Cara Setup N8N Webhook
                                </h3>
                                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                                    <li>Buat workflow di N8N dengan trigger "Webhook"</li>
                                    <li>Copy webhook URL dari N8N</li>
                                    <li>Paste URL ke field yang sesuai di atas</li>
                                    <li>Aktifkan N8N Webhook dengan toggle switch</li>
                                    <li>Simpan pengaturan</li>
                                </ol>
                            </div>

                            {/* Example Payload */}
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">📦 Contoh Payload</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Contact Form:</p>
                                        <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "subject": "Pertanyaan",
  "message": "Halo..."
}`}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Order:</p>
                                        <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`{
  "orderId": "ORDER-123456",
  "orderNumber": "#12345678",
  "total": 150000,
  "items": [...],
  "customer": {...}
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>⚠️ Penting:</strong> Pastikan N8N instance Anda dapat diakses dari internet dan webhook URL sudah benar. Test webhook setelah konfigurasi untuk memastikan berfungsi dengan baik.
                                </p>
                            </div>
                        </div>
                        </>
                        )}

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
