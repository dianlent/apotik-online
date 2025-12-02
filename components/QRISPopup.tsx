'use client'

import { useEffect, useState } from 'react'
import { X, QrCode, Clock, RefreshCw, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface QRISPopupProps {
    isOpen: boolean
    onClose: () => void
    qrisImage: string
    reference: string
    amount: number
    orderId: string
    onPaymentSuccess: () => void
}

export default function QRISPopup({
    isOpen,
    onClose,
    qrisImage,
    reference,
    amount,
    orderId,
    onPaymentSuccess
}: QRISPopupProps) {
    const [checking, setChecking] = useState(false)
    const [countdown, setCountdown] = useState(180) // 3 minutes
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'expired'>('pending')

    useEffect(() => {
        if (!isOpen) return

        // Reset countdown and status when popup opens
        setCountdown(180) // 3 minutes
        setPaymentStatus('pending')

        // Start countdown
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setPaymentStatus('expired')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // Auto check payment status every 5 seconds
        const statusChecker = setInterval(() => {
            checkPaymentStatus()
        }, 5000)

        return () => {
            clearInterval(timer)
            clearInterval(statusChecker)
        }
    }, [isOpen, reference])

    async function checkPaymentStatus() {
        if (!reference || checking) return

        setChecking(true)
        try {
            const response = await fetch(`/api/payment/status?reference=${reference}`)
            
            if (!response.ok) {
                console.warn('Payment status check failed:', response.status)
                return
            }

            const data = await response.json()

            if (data.status === 'SUCCESS' || data.statusCode === '00') {
                setPaymentStatus('success')
                setTimeout(() => {
                    onPaymentSuccess()
                }, 2000)
            } else if (data.status === 'FAILED') {
                setPaymentStatus('failed')
            } else if (data.status === 'EXPIRED') {
                setPaymentStatus('expired')
            }
        } catch (error) {
            console.error('Error checking payment status:', error instanceof Error ? error.message : 'Unknown error')
        } finally {
            setChecking(false)
        }
    }

    function formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>

                    {/* Success Overlay */}
                    {paymentStatus === 'success' && (
                        <div className="absolute inset-0 bg-green-600 bg-opacity-95 flex flex-col items-center justify-center rounded-2xl z-20">
                            <CheckCircle className="h-20 w-20 text-white mb-4 animate-bounce" />
                            <h3 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil!</h3>
                            <p className="text-green-100">Mengarahkan ke halaman transaksi...</p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center rounded-t-2xl">
                        <QrCode className="h-12 w-12 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold">Scan QRIS</h2>
                        <p className="text-blue-100 mt-2 text-sm">
                            Gunakan aplikasi e-wallet atau mobile banking
                        </p>
                        <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
                            <p className="text-sm text-blue-100">Total Pembayaran</p>
                            <p className="text-2xl font-bold">Rp {amount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* QRIS Code */}
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
                                <p className="text-xs text-gray-600 mb-1">Nomor Referensi:</p>
                                <p className="font-mono text-sm font-semibold text-gray-900 break-all">{reference}</p>
                            </div>
                        )}

                        {/* Countdown Timer */}
                        <div className={`mb-6 p-4 rounded-lg border ${
                            countdown === 0 
                                ? 'bg-red-50 border-red-200' 
                                : countdown < 60 
                                    ? 'bg-orange-50 border-orange-200' 
                                    : 'bg-yellow-50 border-yellow-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className={`h-5 w-5 ${
                                        countdown === 0 
                                            ? 'text-red-600' 
                                            : countdown < 60 
                                                ? 'text-orange-600 animate-pulse' 
                                                : 'text-yellow-600'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                        countdown === 0 
                                            ? 'text-red-800' 
                                            : countdown < 60 
                                                ? 'text-orange-800' 
                                                : 'text-yellow-800'
                                    }`}>
                                        Waktu tersisa:
                                    </span>
                                </div>
                                <span className={`text-lg font-bold ${
                                    countdown === 0 
                                        ? 'text-red-900' 
                                        : countdown < 60 
                                            ? 'text-orange-900' 
                                            : 'text-yellow-900'
                                }`}>
                                    {formatTime(countdown)}
                                </span>
                            </div>
                            {countdown === 0 && (
                                <p className="text-xs text-red-800 mt-2 font-semibold">
                                    ⚠️ Waktu pembayaran habis. Silakan tutup dan buat pesanan baru.
                                </p>
                            )}
                            {countdown > 0 && countdown < 60 && (
                                <p className="text-xs text-orange-800 mt-2">
                                    ⏰ Segera selesaikan pembayaran!
                                </p>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-3 text-sm">Cara Pembayaran:</h3>
                            <ol className="space-y-2 text-xs text-blue-800">
                                <li className="flex items-start">
                                    <span className="font-bold mr-2">1.</span>
                                    <span>Buka aplikasi e-wallet atau mobile banking</span>
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
                                    <span>Konfirmasi pembayaran di aplikasi</span>
                                </li>
                            </ol>
                        </div>

                        {/* Status Checking */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                                <RefreshCw className={`h-4 w-4 text-gray-600 ${checking ? 'animate-spin' : ''}`} />
                                <span className="text-xs text-gray-600">
                                    {checking ? 'Memeriksa status...' : 'Menunggu pembayaran...'}
                                </span>
                            </div>
                        </div>

                        {/* Manual Check Button */}
                        <button
                            onClick={() => checkPaymentStatus()}
                            disabled={checking || countdown === 0}
                            className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {countdown === 0 
                                ? 'Waktu Habis' 
                                : checking 
                                    ? 'Memeriksa...' 
                                    : 'Cek Status Pembayaran'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
