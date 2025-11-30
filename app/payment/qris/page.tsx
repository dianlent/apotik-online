'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { QrCode, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import Image from 'next/image'

function QRISPaymentContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [qrisImage, setQrisImage] = useState<string>('')
    const [reference, setReference] = useState<string>('')
    const [checking, setChecking] = useState(false)
    const [countdown, setCountdown] = useState(300) // 5 minutes

    useEffect(() => {
        // Get QRIS data from localStorage or URL
        const qris = localStorage.getItem('qrisImage') || ''
        const ref = searchParams.get('reference') || localStorage.getItem('qrisReference') || ''
        
        setQrisImage(qris)
        setReference(ref)

        // Start countdown
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // Auto check payment status every 5 seconds
        const statusChecker = setInterval(() => {
            checkPaymentStatus(ref)
        }, 5000)

        return () => {
            clearInterval(timer)
            clearInterval(statusChecker)
        }
    }, [searchParams])

    async function checkPaymentStatus(ref: string) {
        if (!ref || checking) return

        setChecking(true)
        try {
            const response = await fetch(`/api/payment/status?reference=${ref}`)
            const data = await response.json()

            if (data.status === 'SUCCESS' || data.statusCode === '00') {
                // Payment successful
                localStorage.removeItem('qrisImage')
                localStorage.removeItem('qrisReference')
                router.push('/payment/success')
            }
        } catch (error) {
            console.error('Error checking payment status:', error)
        } finally {
            setChecking(false)
        }
    }

    function formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-responsive max-w-2xl">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
                        <QrCode className="h-12 w-12 mx-auto mb-3" />
                        <h1 className="text-2xl font-bold">Scan QRIS untuk Membayar</h1>
                        <p className="text-blue-100 mt-2">
                            Gunakan aplikasi e-wallet atau mobile banking Anda
                        </p>
                    </div>

                    {/* QRIS Code */}
                    <div className="p-8">
                        {qrisImage ? (
                            <div className="mb-6">
                                <div className="relative w-full max-w-sm mx-auto aspect-square bg-white border-4 border-blue-200 rounded-lg overflow-hidden shadow-lg">
                                    <Image
                                        src={qrisImage}
                                        alt="QRIS Code"
                                        fill
                                        className="object-contain p-4"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat QRIS...</p>
                            </div>
                        )}

                        {/* Reference Number */}
                        {reference && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Nomor Referensi:</p>
                                <p className="font-mono font-semibold text-gray-900">{reference}</p>
                            </div>
                        )}

                        {/* Countdown Timer */}
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800">
                                        Waktu tersisa:
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-yellow-900">
                                    {formatTime(countdown)}
                                </span>
                            </div>
                            {countdown === 0 && (
                                <p className="text-sm text-yellow-800 mt-2">
                                    ⚠️ Waktu pembayaran habis. Silakan buat pesanan baru.
                                </p>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-3">Cara Pembayaran:</h3>
                            <ol className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">1.</span>
                                    <span>Buka aplikasi e-wallet atau mobile banking Anda</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">2.</span>
                                    <span>Pilih menu "Scan QR" atau "QRIS"</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">3.</span>
                                    <span>Arahkan kamera ke QR code di atas</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">4.</span>
                                    <span>Konfirmasi pembayaran di aplikasi Anda</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">5.</span>
                                    <span>Tunggu konfirmasi pembayaran berhasil</span>
                                </li>
                            </ol>
                        </div>

                        {/* Status Checking */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                                <RefreshCw className={`h-4 w-4 text-gray-600 ${checking ? 'animate-spin' : ''}`} />
                                <span className="text-sm text-gray-600">
                                    {checking ? 'Memeriksa status...' : 'Menunggu pembayaran...'}
                                </span>
                            </div>
                        </div>

                        {/* Supported Apps */}
                        <div className="border-t border-gray-200 pt-6">
                            <p className="text-sm text-gray-600 text-center mb-3">
                                Didukung oleh:
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    GoPay
                                </span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    OVO
                                </span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    DANA
                                </span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    ShopeePay
                                </span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    LinkAja
                                </span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    Bank Apps
                                </span>
                            </div>
                        </div>

                        {/* Manual Check Button */}
                        <div className="mt-6">
                            <button
                                onClick={() => checkPaymentStatus(reference)}
                                disabled={checking}
                                className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checking ? 'Memeriksa...' : 'Cek Status Pembayaran'}
                            </button>
                        </div>

                        {/* Cancel */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => router.push('/order')}
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                Batalkan Pembayaran
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Halaman ini akan otomatis redirect setelah pembayaran berhasil</p>
                </div>
            </div>
        </div>
    )
}

export default function QRISPaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat pembayaran...</p>
                </div>
            </div>
        }>
            <QRISPaymentContent />
        </Suspense>
    )
}
