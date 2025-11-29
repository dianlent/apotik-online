'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GeneralSettings {
    storeName: string
    storeEmail: string
    storePhone: string
    storeAddress: string
    taxRate: string
    currency: string
    duitkuMerchantCode: string
    duitkuApiKey: string
    duitkuCallbackUrl: string
    duitkuReturnUrl: string
    duitkuSandboxMode: boolean
    // Payment Methods
    bankName: string
    bankAccountNumber: string
    bankAccountName: string
    enableCash: boolean
    enableCard: boolean
    enableQris: boolean
    enableTransfer: boolean
}

interface SettingsContextType {
    generalSettings: GeneralSettings
    updateGeneralSettings: (settings: GeneralSettings) => Promise<void>
    loading: boolean
}

const defaultSettings: GeneralSettings = {
    storeName: 'APOTIK POS',
    storeEmail: 'info@apotikpos.com',
    storePhone: '+62 812-3456-7890',
    storeAddress: 'Jl. Kesehatan No. 123, Jakarta',
    taxRate: '11',
    currency: 'IDR',
    duitkuMerchantCode: '',
    duitkuApiKey: '',
    duitkuCallbackUrl: '',
    duitkuReturnUrl: '',
    duitkuSandboxMode: true,
    // Payment Methods
    bankName: 'BCA',
    bankAccountNumber: '1234567890',
    bankAccountName: 'APOTIK POS',
    enableCash: true,
    enableCard: true,
    enableQris: true,
    enableTransfer: true
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultSettings)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'general')
                .single()

            if (error) {
                // If table doesn't exist or no data, use defaults
                if (error.code === 'PGRST205' || error.code === 'PGRST116') {
                    console.warn('Settings table not found or empty, using defaults')
                    setLoading(false)
                    return
                }
                console.error('Error loading settings:', error)
                setLoading(false)
                return
            }

            if (data && data.value) {
                setGeneralSettings(data.value as GeneralSettings)
            }
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateGeneralSettings = async (settings: GeneralSettings) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            const { error } = await supabase
                .from('settings')
                .update({ 
                    value: settings,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                })
                .eq('key', 'general')

            if (error) throw error

            // Update local state
            setGeneralSettings(settings)
        } catch (error) {
            console.error('Error updating settings:', error)
            throw error
        }
    }

    return (
        <SettingsContext.Provider value={{ generalSettings, updateGeneralSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
