'use client'

import { useState, useEffect, useRef } from 'react'
import { Scan, X, Keyboard } from 'lucide-react'

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
    isOpen: boolean
    onClose: () => void
}

export default function BarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
    const [barcode, setBarcode] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const scanTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const handleScan = () => {
        if (barcode.trim()) {
            onScan(barcode.trim())
            setBarcode('')
            onClose()
        }
    }

    useEffect(() => {
        // Listen for keyboard input when scanner is active
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isOpen) return

            // Barcode scanners typically send Enter after scanning
            if (e.key === 'Enter' && barcode.length > 0) {
                handleScan()
            }
        }

        window.addEventListener('keypress', handleKeyPress)
        return () => window.removeEventListener('keypress', handleKeyPress)
    }, [isOpen, barcode])

    const handleInputChange = (value: string) => {
        setBarcode(value)
        setIsScanning(true)

        // Clear previous timeout
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current)
        }

        // Auto-scan after 100ms of no input (simulates barcode scanner behavior)
        scanTimeoutRef.current = setTimeout(() => {
            setIsScanning(false)
        }, 100)
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleScan()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <Scan className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Barcode</h2>
                    <p className="text-gray-600">
                        Gunakan barcode scanner atau ketik manual
                    </p>
                </div>

                <form onSubmit={handleManualSubmit}>
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={barcode}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Scan atau ketik barcode..."
                                className="w-full px-4 py-4 text-center text-2xl font-mono border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Keyboard className="h-6 w-6 text-gray-400" />
                            </div>
                        </div>
                        {isScanning && (
                            <div className="mt-2 flex items-center justify-center text-blue-600 text-sm">
                                <div className="animate-pulse flex items-center">
                                    <div className="h-2 w-2 bg-blue-600 rounded-full mr-2"></div>
                                    Scanning...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={!barcode.trim()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Scan
                        </button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Tips:</strong> Arahkan barcode scanner ke input field dan scan produk. 
                        Barcode akan otomatis terdeteksi.
                    </p>
                </div>
            </div>
        </div>
    )
}
